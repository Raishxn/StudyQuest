"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useChatStore, Conversation } from '@/stores/chatStore';
import { useSocket } from '@/hooks/useSocket';
import { ChatNewConversationModal } from './components/ChatNewConversationModal';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChatPage() {
    // Simulating token fetching for our socket connection demo
    const token = typeof window !== 'undefined' ? localStorage.getItem('sq-token') : null;
    const { socket, isConnected, emit, on } = useSocket(token);

    const setConversations = useChatStore((state: any) => state.setConversations);
    const conversationsMap = useChatStore((state: any) => state.conversations);
    const unreadCountsMap = useChatStore((state: any) => state.unreadCounts);

    const [loading, setLoading] = useState(true);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    // Initial fetch for conversations (would typically be a REST call via React Query)
    useEffect(() => {
        // Mocking an initial fetch, replace with your actual API call
        const fetchChats = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/chat`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (error) {
                console.error("Failed to load chats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchChats();
    }, [token, setConversations]);

    const conversations = Array.from(conversationsMap.values()).sort((a: any, b: any) => {
        const timeA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
        const timeB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
        return timeB - timeA;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full md:w-80 lg:w-96 flex-shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Mensagens {isConnected ? '🟢' : '🔴'}</h2>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shadow-sm"
                >
                    + Nova
                </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
                {loading ? (
                    <div className="p-4 text-center text-slate-500">Carregando chats...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">💬</div>
                        <p>Nenhuma conversa ainda.</p>
                    </div>
                ) : (
                    conversations.map((chat: any) => {
                        const lastMessage = chat.messages?.[0];
                        const unreadCount = unreadCountsMap.get(chat.id) || 0;
                        // Pegar o outro membro (simplificado para DM)
                        const otherMember = chat.members?.find((m: any) => m.userId !== 'my-user-id')?.user; // Substituir 'my-user-id'

                        return (
                            <Link
                                key={chat.id}
                                href={`/chat/${chat.id}`}
                                className="w-full flex items-center p-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex flex-shrink-0 items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden dark:bg-indigo-900 dark:text-indigo-300 dark:border-slate-800">
                                    {otherMember?.avatarUrl ? <img src={otherMember.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (chat.type === 'GROUP' ? 'GR' : (otherMember?.username?.substring(0, 2).toUpperCase() || '?'))}
                                </div>

                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                                            {chat.type === 'GROUP' ? chat.name : (otherMember?.username || 'Usuário')}
                                        </h3>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {lastMessage ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: ptBR }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate pr-2 ${unreadCount > 0 ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {lastMessage?.senderId === 'my-user-id' ? 'Você: ' : ''}{lastMessage?.body || 'Arquivo enviado'}
                                        </p>
                                        {unreadCount > 0 && (
                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center shadow-sm block translate-y-[-1px]">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>

            <ChatNewConversationModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
            />
        </div>
    );
}
