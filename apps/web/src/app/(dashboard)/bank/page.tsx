'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBankItems } from '../../../lib/api/bank';
import { BankItemCard } from '../../../components/bank/BankItemCard';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export default function BankPage() {
    const [searchSubject, setSearchSubject] = useState('');
    const [debouncedSubject, setDebouncedSubject] = useState('');
    const [sort, setSort] = useState('recent');
    const [type, setType] = useState('');

    // Debounce simple
    useState(() => {
        const timeout = setTimeout(() => setDebouncedSubject(searchSubject), 400);
        return () => clearTimeout(timeout);
    });

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['bank-items', debouncedSubject, sort, type],
        queryFn: ({ pageParam }) => fetchBankItems({ cursor: pageParam as string | undefined, subject: debouncedSubject, sort, type }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    const items = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">Banco de Provas</h1>
                    <p className="text-text-muted text-sm mt-1">Materiais de estudo comunitários</p>
                </div>
                <Link
                    href="/bank/upload"
                    className="flex items-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" /> Enviar Material
                </Link>
            </div>

            {/* Layout Main */}
            <div className="flex flex-col md:flex-row gap-6 items-start">

                {/* Left Aside Filters (Desktop) / Top Filters (Mobile) */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                    <div className="bg-background-surface border border-border-strong rounded-2xl p-4">
                        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filtros
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Disciplina</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Ex: Cálculo 1"
                                        className="w-full bg-background-base border border-border-subtle rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary transition-colors"
                                        value={searchSubject}
                                        onChange={(e) => setSearchSubject(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Tipo de Material</label>
                                <select
                                    className="w-full bg-background-base border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary transition-colors"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="EXAM">Provas</option>
                                    <option value="EXERCISE">Listas de Exercícios</option>
                                    <option value="ANSWER">Gabaritos</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Ordenar por</label>
                                <select
                                    className="w-full bg-background-base border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary transition-colors"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                >
                                    <option value="recent">Mais Recentes</option>
                                    <option value="rating">Melhor Avaliados</option>
                                    <option value="comments">Mais Comentados</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Grid */}
                <div className="flex-1 w-full flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-background-surface border border-border-dashed rounded-2xl">
                            <div className="text-4xl mb-4">📭</div>
                            <h3 className="text-lg font-bold text-text-primary mb-1">Nenhum material encontrado</h3>
                            <p className="text-sm text-text-muted">Ajuste os filtros ou seja o primeiro a enviar algo para esta busca!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {items.map((item: any) => (
                                <BankItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}

                    {hasNextPage && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="bg-background-surface hover:bg-background-elevated border border-border-strong text-text-primary font-bold px-6 py-2.5 rounded-xl transition-colors active:scale-95 flex items-center gap-2"
                            >
                                {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carregar mais...'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
