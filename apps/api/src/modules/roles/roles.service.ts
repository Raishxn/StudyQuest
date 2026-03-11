import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, hasMinRole } from '../../common/enums/role.enum';
import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@Injectable()
@WebSocketGateway()
export class RolesService {
    @WebSocketServer()
    server: Server;

    constructor(private prisma: PrismaService) { }

    async assignRole(actorId: string, targetUserId: string, newRole: Role, reason?: string) {
        if (newRole === Role.OWNER) {
            throw new ForbiddenException('Não é possível atribuir a permissão máxima OWNER.');
        }

        const actor = await this.prisma.user.findUnique({ where: { id: actorId } });
        const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });

        if (!actor || !target) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        const actorRole = actor.role as Role;
        const targetRole = target.role as Role;

        // Rules for promotion based on actor level
        if (newRole === Role.MOD_JUNIOR && !hasMinRole(actorRole, Role.MOD_SENIOR)) {
            throw new ForbiddenException('Apenas Moderadores Seniores ou superior podem promover a Moderador Junior.');
        }
        if ((newRole === Role.MOD_SENIOR || newRole === Role.SUPPORT) && !hasMinRole(actorRole, Role.ADMIN)) {
            throw new ForbiddenException('Apenas Admins ou superior podem promover aos cargos Moderador Senior ou Support.');
        }
        if (newRole === Role.ADMIN && actorRole !== Role.OWNER) {
            throw new ForbiddenException('Apenas o Owner pode promover novos Admins.');
        }

        // Rules for demotion attempting / target defense
        if (hasMinRole(targetRole, actorRole) && actorRole !== Role.OWNER) {
            throw new ForbiddenException('Você não pode alterar o cargo de alguém do mesmo nível hierarquico ou superior.');
        }

        // Update Role
        const updatedUser = await this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                role: newRole,
                roleAssignedAt: new Date(),
                roleAssignedBy: actorId,
            },
        });

        // Create Audit Log
        await this.prisma.roleAuditLog.create({
            data: {
                actorId,
                targetUserId,
                fromRole: targetRole,
                toRole: newRole,
                reason,
            },
        });

        // Fire websocket to active user to update frontend permissions instantly
        if (this.server) {
            this.server.to(`user_${targetUserId}`).emit('role:updated', { newRole });
        }

        return { success: true, newRole, targetUser: { id: target.id, username: target.username } };
    }

    async revokeRole(actorId: string, targetUserId: string, reason?: string) {
        // Default to USER, as banning is a different explicit action
        return this.assignRole(actorId, targetUserId, Role.USER, reason);
    }

    async getRoleHistory(targetUserId: string) {
        return this.prisma.roleAuditLog.findMany({
            where: { targetUserId },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: { select: { id: true, username: true } },
            },
        });
    }
}
