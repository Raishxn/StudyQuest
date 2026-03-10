'use client';

import { useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { fetchPosts, togglePostUpvote } from '../../../lib/api/forum';
import { PostCard } from '../../../components/forum/PostCard';
import { toast } from 'sonner';

export default function ForumPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [sort, setSort] = useState<'recent' | 'votes' | 'unanswered'>('recent');

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(handler);
    }, [search]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['forum-posts', debouncedSearch, subjectFilter, sort],
        queryFn: ({ pageParam }) => fetchPosts({
            pageParam,
            subject: subjectFilter,
            tags: debouncedSearch ? [debouncedSearch] : [],
            sort
        }),
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    const upvoteMutation = useMutation({
        mutationFn: togglePostUpvote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const handleUpvote = (id: string) => {
        upvoteMutation.mutate(id);
    };

    const posts = data?.pages.flatMap(page => page.data) || [];

    return (
        <div className="max-w-4xl mx-auto py-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">Fórum da Comunidade</h1>
                    <p className="text-text-muted mt-1">Compartilhe dúvidas e aprenda com outros estudantes.</p>
                </div>
                <Link
                    href="/forum/new"
                    className="bg-accent-primary hover:bg-accent-secondary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Nova Pergunta
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-background-surface border border-border-subtle p-4 rounded-xl flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por tags ou palavras-chave..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background-base border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-accent-primary"
                    />
                </div>

                {/* Subject Select */}
                <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                >
                    <option value="">Todas as Matérias</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biologia">Biologia</option>
                    <option value="História">História</option>
                    <option value="Geografia">Geografia</option>
                    <option value="Programação">Programação</option>
                    <option value="Outros">Outros</option>
                </select>

                {/* Sort Buttons */}
                <div className="flex bg-background-base rounded-lg border border-border-subtle overflow-hidden">
                    <button
                        onClick={() => setSort('recent')}
                        className={`px-3 py-2 text-xs font-bold transition-colors ${sort === 'recent' ? 'bg-accent-primary text-white' : 'text-text-muted hover:bg-background-surface'}`}
                    >
                        Recentes
                    </button>
                    <button
                        onClick={() => setSort('unanswered')}
                        className={`px-3 py-2 text-xs font-bold transition-colors border-l border-border-subtle ${sort === 'unanswered' ? 'bg-accent-primary text-white' : 'text-text-muted hover:bg-background-surface'}`}
                    >
                        Sem resposta
                    </button>
                    <button
                        onClick={() => setSort('votes')}
                        className={`px-3 py-2 text-xs font-bold transition-colors border-l border-border-subtle ${sort === 'votes' ? 'bg-accent-primary text-white' : 'text-text-muted hover:bg-background-surface'}`}
                    >
                        Mais Votados
                    </button>
                </div>
            </div>

            {/* Post List */}
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>
                ) : posts.length === 0 ? (
                    <div className="text-center p-12 bg-background-surface border border-border-subtle rounded-xl flex flex-col items-center">
                        <Filter className="w-12 h-12 text-border-strong mb-4" />
                        <h3 className="text-lg font-bold text-text-primary">Nenhum post encontrado</h3>
                        <p className="text-text-muted mt-2 max-w-sm">Tente ajustar seus filtros ou seja o primeiro a fazer uma pergunta sobre este tópico!</p>
                    </div>
                ) : (
                    posts.map((post: any) => (
                        <PostCard key={post.id} post={post} onUpvote={handleUpvote} />
                    ))
                )}

                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="mt-4 py-3 bg-background-surface hover:bg-background-elevated border border-border-subtle rounded-xl text-sm font-bold text-text-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
                        Carregar mais
                    </button>
                )}
            </div>
        </div>
    );
}
