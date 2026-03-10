import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    on: (event: string, handler: (...args: any[]) => void) => void;
    emit: (event: string, data?: any) => void;
}

export const useSocket = (token?: string | null): UseSocketReturn => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Inicializar socket com JWT
        const socket = io(SOCKET_SERVER_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [token]);

    const on = (event: string, handler: (...args: any[]) => void) => {
        useEffect(() => {
            if (!socketRef.current) return;
            socketRef.current.on(event, handler);
            return () => {
                socketRef.current?.off(event, handler);
            };
        }, [event, handler]);
    };

    const emit = (event: string, data?: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn(`Cannot emit '${event}'. Socket is not connected.`);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        on,
        emit,
    };
};
