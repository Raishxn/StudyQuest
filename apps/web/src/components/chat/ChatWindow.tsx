"use client";

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/stores/chatStore';


export function ChatWindow({ chatId }: { chatId: string }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('studyquest_token') : null;
    const { socket, isConnected, on, emit } = useSocket(token);

    const messagesMap = useChatStore((state: any) => state.messages);
    const addMessage = useChatStore((state: any) => state.addMessage);
    const setMessages = useChatStore((state: any) => state.setMessages);
    const markAsRead = useChatStore((state: any) => state.markAsRead);
    const setActiveConversation = useChatStore((state: any) => state.setActiveConversation);

    const messages = messagesMap.get(chatId) || [];

    const [inputText, setInputText] = useState('');
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const scrollRef = useRef<HTMLDivElement>(null);

    const myUserId = 'my-user-id'; // Substituir pela store de auth

    // Join Room e Load History
    useEffect(() => {
        setActiveConversation(chatId);
        markAsRead(chatId);

        if (isConnected) {
            emit('chat:join', { chatId });
        }

        return () => {
            setActiveConversation(null); // Cleanup
        };
    }, [chatId, isConnected]);

    // Listeners Events
    useEffect(() => {
        on('chat:history', (historyMsgs: any) => {
            setMessages(chatId, historyMsgs);
        });

        on('chat:newMessage', (msg: any) => {
            if (msg.conversationId === chatId) {
                addMessage(chatId, msg);
                if (msg.senderId !== myUserId) {
                    markAsRead(chatId); // Se estiver ativo, já marca
                }
            }
        });

        on('chat:typing', ({ userId, chatId: incomingChatId }: any) => {
            if (incomingChatId === chatId && userId !== myUserId) {
                setTypingUsers(prev => new Set(prev).add(userId));
                // Remover após x segs
                setTimeout(() => {
                    setTypingUsers(prev => {
                        const next = new Set(prev);
                        next.delete(userId);
                        return next;
                    });
                }, 3000);
            }
        });
    }, [chatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        emit('chat:message', { chatId, body: inputText });
        setInputText('');
    };

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);

        // Throttle typing event
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        emit('chat:typing', { chatId });

        typingTimeoutRef.current = setTimeout(() => { }, 1000);
    };



    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-10 shadow-sm">
                {/* Placeholder para status e session infos */}
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 text-slate-600 text-xs font-bold font-mono">
                        CH
                    </div>
                    <div className="ml-3">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Chat Room</h2>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex h-2 w-2 relative mr-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative p-4" ref={scrollRef}>
                <div className="flex flex-col space-y-2">
                    {messages.map((msg: any, index: number) => {
                        const isMe = msg.senderId === myUserId;
                        return (
                            <div key={msg.id || index} className={`flex w-full py-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 h-8 mr-2 flex-shrink-0 mt-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs text-slate-600 dark:text-slate-300 font-bold">
                                        {msg.sender?.avatarUrl ? <img src={msg.sender.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : msg.sender?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm relative group ${isMe ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'}`}>
                                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                                    <span className="text-[10px] mt-1 block text-right font-medium opacity-70">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
                <div className="px-6 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <div className="flex space-x-1 mr-2 bg-slate-200 dark:bg-slate-800 rounded-full px-2 py-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                    </div>
                    <span>Alguem está digitando...</span>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-end max-w-4xl mx-auto relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                    <button className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
                        📎
                    </button>
                    <textarea
                        value={inputText}
                        onChange={handleTyping}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Digite uma mensagem..."
                        className="flex-1 max-h-32 min-h-12 bg-transparent border-none resize-none focus:ring-0 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="p-3 disabled:opacity-50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors m-1 font-medium text-sm flex items-center justify-center min-w-12 h-10"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
}
