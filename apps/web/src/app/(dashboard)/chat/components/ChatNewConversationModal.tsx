'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { X, Search, Users, MessageSquarePlus } from 'lucide-react';
import { getFriends, createDM } from '../../../../lib/api/friends';
import { toast } from 'sonner';

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatNewConversationModal({ isOpen, onClose }: NewConversationModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const { data: friendsList, isLoading } = useQuery({
        queryKey: ['friends', 'accepted'],
        queryFn: () => getFriends(),
        enabled: isOpen,
    });

    const startChatMutation = useMutation({
        mutationFn: createDM,
        onSuccess: (chatData) => {
            onClose();
            router.push(`/chat/${chatData.id}`);
        },
        onError: () => {
            toast.error('Erro ao iniciar conversa');
        },
    });

    if (!isOpen) return null;

    const friends = Array.isArray(friendsList) ? friendsList : [];

    const filteredFriends = friends.filter((f: any) =>
        f.friend?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquarePlus className="w-5 h-5 text-indigo-500" />
                        Nova Conversa
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar amigo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-1">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center">
                            <Users className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm">Você ainda não tem amigos adicionados.</p>
                            <button
                                onClick={() => { onClose(); router.push('/amigos'); }}
                                className="mt-4 text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                            >
                                Buscar Amigos
                            </button>
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            Nenhum amigo encontrado para "{searchTerm}"
                        </div>
                    ) : (
                        filteredFriends.map((f: any) => {
                            const friend = f.friend;
                            const initials = friend.username?.substring(0, 2).toUpperCase() || '??';

                            return (
                                <button
                                    key={friend.id}
                                    onClick={() => startChatMutation.mutate(friend.id)}
                                    disabled={startChatMutation.isPending}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {friend.avatarUrl ? (
                                            <img src={friend.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                                                {initials}
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {friend.username}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Lvl {friend.level}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
