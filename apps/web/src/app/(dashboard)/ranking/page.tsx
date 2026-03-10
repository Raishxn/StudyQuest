'use client';

import React, { useState, useEffect } from 'react';
import { Podium } from '@/components/ranking/Podium';
import { RankingList } from '@/components/ranking/RankingList';
import { fetchRanking, RankingResponse } from '@/lib/api/ranking';
import { Trophy, Users, GraduationCap, BookOpen, Loader2 } from 'lucide-react';

const TABS = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'friends', label: 'Amigos', icon: Users },
    { id: 'institution', label: 'Minha Uni', icon: GraduationCap },
    { id: 'subject', label: 'Matérias', icon: BookOpen },
];

const PERIODS = [
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensal' },
    { id: 'alltime', label: 'Tudo' },
];

export default function RankingPage() {
    const [activeTab, setActiveTab] = useState('global');
    const [activePeriod, setActivePeriod] = useState('weekly');
    const [data, setData] = useState<RankingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchRanking(activeTab, activePeriod);
                setData(res);
            } catch (err: any) {
                setError(err.message || 'Erro ao carregar rankings');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, activePeriod]);

    return (
        <div className="flex flex-col min-h-screen bg-background-base">
            {/* Header & Tabs */}
            <div className="bg-bg-surface border-b border-border-subtle pt-8 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-cinzel font-black mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-warning" />
                        RANKINGS
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                  ${activeTab === tab.id
                                        ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20 scale-105'
                                        : 'bg-bg-elevated text-text-secondary hover:bg-border-subtle hover:text-text-primary'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 border-b border-border-subtle">
                        {PERIODS.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setActivePeriod(p.id)}
                                className={`pb-3 text-sm font-bold transition-all relative
                  ${activePeriod === p.id
                                        ? 'text-accent-primary'
                                        : 'text-text-muted hover:text-text-secondary'
                                    }`}
                            >
                                {p.label}
                                {activePeriod === p.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-primary rounded-t-full transition-all" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
                        <p className="font-cinzel text-text-muted animate-pulse">Consultando os pergaminhos...</p>
                    </div>
                ) : error ? (
                    <div className="max-w-lg mx-auto text-center py-24 bg-danger/5 border border-danger/20 rounded-2xl p-8">
                        <p className="text-danger font-bold mb-2">Ops! Algo deu errado.</p>
                        <p className="text-text-secondary text-sm mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-danger text-white px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : data ? (
                    <div className="animate-in fade-in duration-700">
                        <Podium top3={data.top3} />
                        <div className="mt-8">
                            <div className="max-w-4xl mx-auto mb-6 px-2 flex items-center justify-between">
                                <h2 className="font-cinzel font-bold text-text-secondary uppercase tracking-widest text-sm">Top 100 Jogadores</h2>
                                <span className="text-xs font-mono text-text-muted">Total: {data.totalLimit || data.list.length + 3}</span>
                            </div>
                            <RankingList users={data.list.map((u, i) => ({ ...u, rank: i + 4 }))} currentUserId="me" />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Floating User Highscore Bar */}
            {data?.userPosition && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="bg-bg-surface/80 backdrop-blur-xl border border-accent-primary/50 rounded-2xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-accent-primary text-white font-cinzel font-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-accent-primary/40">
                                #{data.userPosition}
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold tracking-widest text-text-secondary">Sua Posição</p>
                                <p className="font-cinzel font-black text-text-primary">VOCÊ</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase font-bold tracking-widest text-text-secondary">Categoria</p>
                            <p className="font-mono text-accent-primary font-bold">{activeTab.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
