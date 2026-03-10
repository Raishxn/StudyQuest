import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // TODO: Ajustar para a URL do frontend em prod
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('ChatGateway');

    // Mapear socket.id -> userId em memória
    private connectedUsers = new Map<string, string>();

    // Armazenar rate limits (muito simples para o MVP. Ideal: Redis)
    private rateLimits = new Map<string, number[]>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers['authorization']?.split(' ')[1];

            if (!token) {
                throw new Error('No token provided');
            }

            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;

            this.connectedUsers.set(client.id, userId);
            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

            // Notificar outros
            this.server.emit('chat:userOnline', { userId });

        } catch (error: any) {
            this.logger.error(`Connection rejected: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.connectedUsers.get(client.id);
        if (userId) {
            this.connectedUsers.delete(client.id);
            this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);

            // Notificar outros
            this.server.emit('chat:userOffline', { userId });
        }
    }

    @SubscribeMessage('chat:join')
    async handleJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody('chatId') chatId: string,
    ) {
        const userId = this.connectedUsers.get(client.id);
        if (!userId) return;

        try {
            // Validar membro
            await this.chatService.validateMember(chatId, userId);

            client.join(chatId);
            this.logger.debug(`User ${userId} joined room ${chatId}`);

            // Buscar últimas mensagens
            const history = await this.chatService.getConversationMessages(chatId, userId, undefined, 50);
            client.emit('chat:history', history);
        } catch (error: any) {
            this.logger.error(`Error joining chat: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('chat:message')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { chatId: string; body?: string; fileUrl?: string },
    ) {
        const userId = this.connectedUsers.get(client.id);
        if (!userId) return;

        if (!this.checkRateLimit(userId)) {
            client.emit('error', { message: 'Rate limit exceeded' });
            return;
        }

        try {
            const message = await this.chatService.saveMessage(
                payload.chatId,
                userId,
                payload.body,
                payload.fileUrl,
            );

            // Emitir para a sala
            this.server.to(payload.chatId).emit('chat:newMessage', message);
        } catch (error: any) {
            this.logger.error(`Error sending message: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('chat:typing')
    async handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody('chatId') chatId: string,
    ) {
        const userId = this.connectedUsers.get(client.id);
        if (!userId) return;

        try {
            await this.chatService.validateMember(chatId, userId);
            // Emitir para a sala (exceto remetente)
            client.to(chatId).emit('chat:typing', { userId, chatId });
        } catch (error) {
            // Ignore if not member
        }
    }

    @SubscribeMessage('chat:read')
    async handleRead(
        @ConnectedSocket() client: Socket,
        @MessageBody('chatId') chatId: string,
    ) {
        // Implementar a marcação real no banco ou redis se necessário no futuro
        // Para simplificar, estamos apenas emitindo 'eventos de leitura' no socket 
        // Ou delegando pro frontend controlar state visual por enquanto
    }

    // --- Função helper para rate limit em memória (30 msgs / minuto) ---
    private checkRateLimit(userId: string): boolean {
        const now = Date.now();
        const limits = this.rateLimits.get(userId) || [];

        // Filtrar msgs mais antigas que 1 min
        const recent = limits.filter(timestamp => now - timestamp < 60000);

        if (recent.length >= 30) {
            return false; // Excedeu
        }

        recent.push(now);
        this.rateLimits.set(userId, recent);
        return true;
    }
}
