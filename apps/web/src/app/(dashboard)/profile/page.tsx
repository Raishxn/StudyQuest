'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import { LevelBadge } from '../../../components/rpg/LevelBadge';
import { AchievementCard } from '../../../components/ui/AchievementCard';
import { EditProfileModal } from '../../../components/profile/EditProfileModal';
import { Trophy, BookOpen, Clock, Flame, Settings, Loader2, Crown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type TabKey = 'achievements' | 'subjects' | 'sessions';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabKey>('achievements');
    const [editOpen, setEditOpen] = useState(false);

    const { data: profile, isLoading, refetch } = useQuery({
        queryKey: ['myProfile'],
        queryFn: async () => {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
    });

    const { data: sessions } = useQuery({
        queryKey: ['mySessions'],
        queryFn: async () => {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/study/sessions?limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return [];
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
        );
    }

    if (!profile) return null;

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'achievements', label: 'Conquistas', icon: Trophy },
        { key: 'subjects', label: 'Matérias', icon: BookOpen },
        { key: 'sessions', label: 'Sessões', icon: Clock },
    ];

    const shiftLabels: Record<string, string> = {
        MORNING: 'Manhã', AFTERNOON: 'Tarde', NIGHT: 'Noite', FULL: 'Integral',
    };

    const maxSubjectHours = profile.subjectStats?.length > 0
        ? Math.max(...profile.subjectStats.map((s: any) => s.hours))
        : 0;

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Hero Section */}
            <div className="bg-background-surface border border-border-subtle rounded-2xl overflow-hidden mb-6 relative shadow-lg">
                {/* Banner */}
                <div className="h-32 sm:h-48 w-full bg-background-elevated relative">
                    {profile.bannerUrl ? (
                        <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-background-surface/80 to-transparent" />
                    )}
                </div>

                {/* Content */}
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12 sm:-mt-16 mb-4">
                        {/* Avatar with level ring */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[4px] border-background-surface shadow-xl overflow-hidden bg-background-elevated flex items-center justify-center relative z-10">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-text-muted">
                                        {profile.username?.slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-0.5 z-20">
                                <LevelBadge level={profile.level} size="sm" />
                            </div>
                        </div>

                        {/* User Info & Edit */}
                        <div className="flex-1 flex flex-row items-center justify-between w-full pt-1 sm:pt-4">
                            <div className="min-w-0 flex-1 pr-4">
                                {profile.name && (
                                    <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-display truncate drop-shadow-sm">
                                        {profile.name}
                                    </h1>
                                )}
                                <p className={`${profile.name ? 'text-sm text-text-secondary' : 'text-xl sm:text-2xl font-bold text-text-primary font-display'} truncate`}>
                                    {profile.name ? `@${profile.username}` : profile.username}
                                </p>
                                <p className="text-xs sm:text-sm text-accent-primary font-bold mt-0.5">
                                    ⚡ {profile.title}
                                </p>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => setEditOpen(true)}
                                className="shrink-0 px-3 py-1.5 rounded-lg bg-background-surface border border-border-subtle text-text-muted hover:text-accent-primary hover:border-accent-primary transition-colors flex items-center gap-2 text-xs font-bold shadow-sm self-start sm:self-auto mt-2 sm:mt-0"
                                title="Editar Perfil"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Editar Perfil</span>
                            </button>
                        </div>
                    </div>

                    {profile.institution && (
                        <p className="text-xs text-text-muted mt-3 mb-2 opacity-80 border-t border-border-subtle pt-3">
                            <span className="inline-flex items-center gap-1">
                                🏛️ {profile.institution.shortName || profile.institution.name}
                                {profile.course && ` · ${profile.course.name}`}
                                {profile.semester && ` · ${profile.semester}º período`}
                                {profile.shift && ` · ${shiftLabels[profile.shift] || profile.shift}`}
                            </span>
                        </p>
                    )}

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                        {[
                            { icon: Clock, label: 'Horas', value: `${profile.stats.totalStudyHours}h` },
                            { icon: Flame, label: 'Streak', value: `${profile.stats.streak || 0}d` },
                            { icon: Crown, label: 'Ranking', value: `#${profile.stats.globalRank || '—'}` },
                            { icon: Trophy, label: 'Conquistas', value: `${profile.stats.achievementsUnlocked}/${profile.stats.totalAchievements}` },
                            { icon: BookOpen, label: 'Sessões', value: profile.stats.totalSessions },
                        ].map((stat, i) => (
                            <div key={i} className={`bg-background-base rounded-xl border border-border-subtle p-3 text-center ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}>
                                <stat.icon className="w-4 h-4 text-accent-primary mx-auto mb-1 opacity-80" />
                                <p className="text-lg font-bold font-mono text-text-primary">{stat.value}</p>
                                <p className="text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-background-surface border border-border-subtle rounded-xl p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                            ? 'bg-accent-primary text-white shadow-md'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'achievements' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.achievements?.map((ach: any) => (
                        <AchievementCard key={ach.id} {...ach} />
                    ))}
                    {(!profile.achievements || profile.achievements.length === 0) && (
                        <p className="col-span-full text-center text-text-muted text-sm py-8">
                            Nenhuma conquista disponível ainda.
                        </p>
                    )}
                </div>
            )}

            {activeTab === 'subjects' && (
                <div className="flex flex-col gap-3">
                    {profile.subjectStats?.length > 0 ? profile.subjectStats.map((s: any) => (
                        <div key={s.subject} className="bg-background-surface border border-border-subtle rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-text-primary">{s.subject}</h4>
                                <div className="flex items-center gap-3 text-xs text-text-muted">
                                    <span>{s.sessions} sessões</span>
                                    <span className="font-mono font-bold text-accent-primary">+{s.xp} XP</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2.5 bg-background-base rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500"
                                        style={{ width: `${maxSubjectHours > 0 ? (s.hours / maxSubjectHours) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-xs font-mono font-bold text-text-secondary whitespace-nowrap">
                                    {s.hours}h
                                </span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-text-muted text-sm py-8">
                            Estude sua primeira matéria para ver estatísticas aqui! 📊
                        </p>
                    )}
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="flex flex-col gap-2">
                    {sessions?.length > 0 ? sessions.map((s: any) => (
                        <div key={s.id} className="bg-background-surface border border-border-subtle rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-text-primary">{s.subject}</p>
                                <p className="text-xs text-text-muted">
                                    {s.topic && `${s.topic} · `}{s.mode} · {Math.round((s.duration || 0) / 60)}min
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono font-bold text-accent-primary">+{s.xpGained} XP</p>
                                <p className="text-[10px] text-text-muted">{new Date(s.startedAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-text-muted text-sm py-8">Nenhuma sessão registrada.</p>
                    )}
                </div>
            )}

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                user={profile}
                onSuccess={() => {
                    refetch();
                    useAuthStore.getState().loadSession();
                }}
            />
        </div>
    );
}
