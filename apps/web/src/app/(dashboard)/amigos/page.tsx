'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Check, X, MessageCircle, ShieldAlert, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    searchUsers,
    getPendingRequests,
    getFriends,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    createDM
} from '../../../lib/api/friends';
import { toast } from 'sonner';
import { useAuthStore } from '../../../stores/authStore';

export default function AmigosPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user } = useAuthStore();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Queries
    const { data: searchResults, isFetching: isSearching, isError: isSearchError } = useQuery({
        queryKey: ['users', 'search', debouncedQuery],
        queryFn: () => searchUsers(debouncedQuery),
        enabled: debouncedQuery.length > 2,
        staleTime: 1000 * 60,
    });

    const { data: pendingRequests, isLoading: isLoadingPending } = useQuery({
        queryKey: ['friends', 'pending'],
        queryFn: getPendingRequests,
    });

    const { data: friendsList, isLoading: isLoadingFriends } = useQuery<any>({
        queryKey: ['friends', 'accepted'],
        queryFn: () => getFriends(),
    });

    // Mutations
    const sendRequestMutation = useMutation({
        mutationFn: sendFriendRequest,
        onSuccess: () => {
            toast.success('Solicitação enviada!');
            setSearchQuery('');
            queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
            queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
        },
        onError: (err: any) => toast.error(err.message || 'Erro ao enviar solicitação'),
    });

    const acceptRequestMutation = useMutation({
        mutationFn: acceptFriendRequest,
        onSuccess: () => {
            toast.success('Solicitação aceita!');
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
        onError: () => toast.error('Erro ao aceitar solicitação'),
    });

    const declineRequestMutation = useMutation({
        mutationFn: removeFriend,
        onSuccess: () => {
            toast.success('Solicitação recusada!');
            queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
        },
        onError: () => toast.error('Erro ao recusar solicitação'),
    });

    const removeFriendMutation = useMutation({
        mutationFn: removeFriend,
        onSuccess: () => {
            toast.success('Amigo removido!');
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
        onError: () => toast.error('Erro ao remover amigo'),
    });

    const startChatMutation = useMutation({
        mutationFn: createDM,
        onSuccess: (chatData: any) => {
            router.push(`/chat/${chatData.id}`);
        },
        onError: () => toast.error('Erro ao iniciar conversa'),
    });

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-6 pb-20 gap-6">

            <div className="flex items-center justify-between mb-2 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-display text-accent-primary uppercase tracking-wide flex items-center gap-3">
                        <UserPlus className="w-8 h-8" />
                        Central de Amigos
                    </h1>
                    <p className="text-text-secondary mt-1">Busque aventureiros para sua jornada</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* LEFT COLUMN: BUSCAR USUÁRIOS & PENDENTES */}
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto">

                    {/* SEARCH SECTION */}
                    <section className="bg-background-surface border border-border-subtle rounded-xl p-4 shadow-sm shrink-0">
                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Buscar Jogadores</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Nome de usuário..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-background-base border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent-primary transition-colors text-text-primary"
                            />
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {debouncedQuery.length <= 2 ? (
                                <p className="text-xs text-center text-text-muted py-4">Digite pelo menos 3 caracteres.</p>
                            ) : isSearching ? (
                                <div className="flex justify-center py-4"><div className="animate-spin w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full" /></div>
                            ) : isSearchError ? (
                                <p className="text-xs text-center text-danger py-4">Erro ao buscar usuários.</p>
                            ) : searchResults?.length === 0 ? (
                                <p className="text-xs text-center text-text-muted py-4">Nenhum usuário encontrado.</p>
                            ) : (
                                searchResults?.map((usr: any) => {
                                    if (usr.id === user?.id) return null; // Don't show self
                                    return (
                                        <div key={usr.id} className="flex items-center justify-between p-2 rounded-lg bg-background-base border border-border-subtle hover:border-accent-primary/40 transition-colors">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Avatar url={usr.avatarUrl} name={usr.username} />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold text-text-primary truncate">{usr.username}</span>
                                                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                                                        Lvl {usr.level} • {usr.title || 'Iniciante'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => sendRequestMutation.mutate(usr.id)}
                                                disabled={sendRequestMutation.isPending}
                                                className="p-1.5 shrink-0 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white rounded-md transition-colors"
                                                title="Enviar Solicitação"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* PENDING SECTION */}
                    <section className="bg-background-surface border border-border-subtle rounded-xl p-4 shadow-sm flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Solicitações</h2>
                            {Array.isArray(pendingRequests) && pendingRequests.length > 0 && (
                                <span className="bg-warning text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 mt-3">
                            {isLoadingPending ? (
                                <p className="text-xs text-center text-text-muted py-4">Carregando...</p>
                            ) : Array.isArray(pendingRequests) && pendingRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-24 text-text-muted">
                                    <ShieldAlert className="w-6 h-6 mb-2 opacity-50" />
                                    <p className="text-xs text-center">Nenhuma solicitação pendente.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {Array.isArray(pendingRequests) && pendingRequests.map((req: any) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                            key={req.id}
                                            className="flex flex-col gap-2 p-3 rounded-lg bg-background-base border border-warning/30 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
                                            <div className="flex items-center gap-2 overflow-hidden px-1">
                                                <Avatar url={req.from.avatarUrl} name={req.from.username} />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold text-text-primary truncate">{req.from.username}</span>
                                                    <span className="text-[10px] text-text-muted">Lvl {req.from.level} quer ser seu amigo</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full mt-1">
                                                <button
                                                    onClick={() => acceptRequestMutation.mutate(req.id)}
                                                    disabled={acceptRequestMutation.isPending}
                                                    className="flex-1 bg-success/10 hover:bg-success text-success hover:text-white text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" /> Aceitar
                                                </button>
                                                <button
                                                    onClick={() => declineRequestMutation.mutate(req.id)}
                                                    disabled={declineRequestMutation.isPending}
                                                    className="flex-1 bg-danger/10 hover:bg-danger text-danger hover:text-white text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <X className="w-3 h-3" /> Recusar
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </section>

                </div>

                {/* RIGHT COLUMN: FRIENDS LIST */}
                <section className="lg:col-span-2 bg-background-surface border border-border-subtle rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-border-subtle shrink-0 flex justify-between items-center bg-background-elevated/30">
                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-warning" />
                            Meus Amigos ({friendsList?.total || 0})
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background-base">
                        {isLoadingFriends ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="animate-pulse h-20 bg-background-elevated rounded-lg border border-border-subtle" />
                                ))}
                            </div>
                        ) : friendsList?.friends?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted">
                                <UserPlus className="w-12 h-12 mb-4 opacity-20 text-accent-primary" />
                                <p className="text-sm text-center max-w-sm">Você ainda não tem amigos. Busque jogadores pelo nome e envie uma solicitação para começar a montar sua guilda!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {friendsList?.friends?.map((f: any) => {
                                        const friend = f.friend;
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                key={f.friendshipId}
                                                className="flex items-center justify-between p-3 rounded-xl bg-background-surface border border-border-subtle hover:border-accent-primary/40 hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="relative">
                                                        <Avatar url={friend.avatarUrl} name={friend.username} size="lg" />
                                                        <div className="absolute -bottom-1 -right-1 bg-background-surface rounded-full p-0.5 border border-border-subtle">
                                                            <div className="bg-accent-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                                                {friend.level}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-text-primary truncate group-hover:text-accent-primary transition-colors">{friend.username}</span>
                                                        <span className="text-[11px] text-accent-muted font-medium truncate">{friend.title || 'Iniciante'}</span>
                                                        <span className="text-[10px] text-text-secondary mt-0.5">{friend.xp || 0} XP Total</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button
                                                        onClick={() => startChatMutation.mutate(friend.id)}
                                                        disabled={startChatMutation.isPending}
                                                        className="p-2 sm:px-3 sm:py-2 bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                                                        title="Enviar Mensagem"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span className="hidden sm:block text-xs font-bold">Chat</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Tem certeza que deseja remover ${friend.username}?`)) {
                                                                removeFriendMutation.mutate(f.friendshipId);
                                                            }
                                                        }}
                                                        className="p-2 text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
                                                        title="Remover Amigo"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}

// Simple Avatar Component Builder
function Avatar({ url, name, size = 'md' }: { url?: string, name: string, size?: 'sm' | 'md' | 'lg' }) {
    const sizeMap = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm'
    };

    const initials = name?.substring(0, 2).toUpperCase() || '??';

    if (url) {
        return <img src={url} alt={name} className={`${sizeMap[size]} rounded-full object-cover border border-border-subtle shrink-0 bg-background-elevated`} />;
    }

    return (
        <div className={`${sizeMap[size]} rounded-full bg-accent-primary/20 text-accent-primary font-bold flex items-center justify-center shrink-0 border border-accent-muted`}>
            {initials}
        </div>
    );
}
