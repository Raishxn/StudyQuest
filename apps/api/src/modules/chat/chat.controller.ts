import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport'; // Assumindo uso de guard existente ou criar JWT Guard genérico
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Um DTO rápido, o ideal seria ir para a pasta dto
export class CreateChatDto {
    type?: 'DM' | 'GROUP';
    targetUserId?: string;
    name?: string;
    memberIds?: string[];
}

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    @ApiOperation({ summary: 'Listar conversas do usuário atual' })
    async getConversations(@Request() req) {
        return this.chatService.getUserConversations(req.user.userId);
    }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova conversa (DM ou Grupo)' })
    async createChat(@Request() req, @Body() dto: CreateChatDto) {
        if (dto.type === 'GROUP') {
            return this.chatService.createGroupChat(req.user.userId, dto.name, dto.memberIds || []);
        } else {
            // Padrão DM
            return this.chatService.createDirectMessage(req.user.userId, dto.targetUserId);
        }
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Histórico paginado de mensagens' })
    async getMessages(
        @Request() req,
        @Param('id') id: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit = 50,
    ) {
        return this.chatService.getConversationMessages(id, req.user.userId, cursor, Number(limit));
    }

    @Post(':id/members')
    @ApiOperation({ summary: 'Adicionar membro a um grupo' })
    async addMember(
        @Request() req,
        @Param('id') id: string,
        @Body('userId') targetUserId: string,
    ) {
        return this.chatService.addMemberToGroup(id, req.user.userId, targetUserId);
    }
}
