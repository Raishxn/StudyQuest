import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async getUserConversations(userId: string) {
        // Buscar conversas que o usuário participa, incluindo as últimas mensagens
        const conversations = await this.prisma.chatConversation.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        conversation: false // Evitar circular dependencies
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1, // Pegar a última mensagem
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // TODO: Implementar contagem real de não lidas via tabela separada futuramente se necessário
        // Por enquanto, enviar 0
        return conversations.map(c => ({
            ...c,
            unreadCount: 0
        }));
    }

    async getConversationMessages(chatId: string, userId: string, cursor?: string, limit = 50) {
        // Validar se o usuário é membro
        await this.validateMember(chatId, userId);

        const messages = await this.prisma.chatMessage.findMany({
            where: { conversationId: chatId },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        return messages.reverse(); // Historico do mais antigo ao mais novo no frontend
    }

    async createDirectMessage(creatorId: string, targetUserId: string) {
        if (creatorId === targetUserId) {
            throw new BadRequestException('Não é possível criar um DM consigo mesmo.');
        }

        // Verificar se DM já existe
        const existingChat = await this.prisma.chatConversation.findFirst({
            where: {
                type: 'DM',
                AND: [
                    { members: { some: { userId: creatorId } } },
                    { members: { some: { userId: targetUserId } } },
                ],
            },
            include: {
                members: true
            }
        });

        if (existingChat) {
            return existingChat;
        }

        return this.prisma.chatConversation.create({
            data: {
                type: 'DM',
                members: {
                    create: [
                        { userId: creatorId },
                        { userId: targetUserId },
                    ],
                },
            },
            include: {
                members: true
            }
        });
    }

    async createGroupChat(creatorId: string, name: string, memberIds: string[]) {
        // Garantir que criador esteja na lista
        const uniqueMembers = Array.from(new Set([...memberIds, creatorId]));

        if (uniqueMembers.length < 2) {
            throw new BadRequestException('Um grupo precisa de pelo menos 2 membros.');
        }

        return this.prisma.chatConversation.create({
            data: {
                type: 'GROUP',
                name,
                members: {
                    create: uniqueMembers.map(id => ({ userId: id })),
                },
            },
            include: {
                members: true
            }
        });
    }

    async addMemberToGroup(chatId: string, requestingUserId: string, targetUserId: string) {
        // Validações básicas e regras de permissão (assumindo que requester precisa ser membro)
        const chat = await this.validateMember(chatId, requestingUserId);

        if (chat.type !== 'GROUP') {
            throw new BadRequestException('Só é possível adicionar membros a grupos.');
        }

        // Verificar se já é membro
        const existingMember = await this.prisma.chatMember.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: chatId,
                    userId: targetUserId
                }
            }
        });

        if (existingMember) {
            return existingMember;
        }

        return this.prisma.chatMember.create({
            data: {
                conversationId: chatId,
                userId: targetUserId
            }
        });
    }

    async saveMessage(chatId: string, senderId: string, body?: string, fileUrl?: string) {
        await this.validateMember(chatId, senderId);

        if (!body && !fileUrl) {
            throw new BadRequestException('Mensagem vazia');
        }

        return this.prisma.chatMessage.create({
            data: {
                conversationId: chatId,
                senderId,
                body,
                fileUrl,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    }
                }
            }
        });
    }

    async validateMember(chatId: string, userId: string) {
        const chat = await this.prisma.chatConversation.findUnique({
            where: { id: chatId },
            include: {
                members: true
            }
        });

        if (!chat) {
            throw new NotFoundException('Conversa não encontrada');
        }

        const isMember = chat.members.some(member => member.userId === userId);
        if (!isMember) {
            throw new ForbiddenException('Usuário não é membro desta conversa');
        }

        return chat;
    }
}
