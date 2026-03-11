'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../stores/authStore';
import { LevelBadge } from '../../../../components/rpg/LevelBadge';
import { AchievementCard } from '../../../../components/ui/AchievementCard';
import { Trophy, BookOpen, Clock, MessageCircle, UserPlus, Check, Loader2, UserCheck } from 'lucide-react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type TabKey = 'achievements' | 'subjects';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const { user: currentUser } = useAuthStore();
    const [friendLoading, setFriendLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('achievements');

    const { data: profile, isLoading } = useQuery({
        queryKey: ['publicProfile', username],
        queryFn: async () => {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('User not found');
            return res.json();
        },
        enabled: !!username,
    });

    const { data: friendStatus, refetch: refetchStatus } = useQuery({
        queryKey: ['friendStatus', profile?.id],
        queryFn: async () => {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/friends/status/${profile.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return { status: 'NONE' };
            return res.json();
        },
        enabled: !!profile?.id && profile?.id !== currentUser?.id,
    });

    const sendFriendRequest = async () => {
        setFriendLoading(true);
        try {
            const token = localStorage.getItem('sq-token');
            await fetch(`${API_URL}/friends/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ targetUserId: profile.id }),
            });
            refetchStatus();
        } catch (err) {
            console.error(err);
        } finally {
            setFriendLoading(false);
        }
    };

    const acceptRequest = async () => {
        if (!friendStatus?.friendshipId) return;
        setFriendLoading(true);
        try {
            const token = localStorage.getItem('sq-token');
            await fetch(`${API_URL}/friends/${friendStatus.friendshipId}/accept`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            refetchStatus();
        } catch (err) {
            console.error(err);
        } finally {
            setFriendLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-text-muted text-lg">Usuário não encontrado.</p>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    const getFriendButton = () => {
        if (isOwnProfile) return null;
        const status = friendStatus?.status;
        const direction = friendStatus?.direction;

        if (status === 'ACCEPTED') {
            return (
                <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/20 text-success text-xs font-bold border border-success/30">
                    <Check className="w-3.5 h-3.5" /> Amigo ✓
                </button>
            );
        }
        if (status === 'PENDING' && direction === 'SENT') {
            return (
                <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-info/20 text-info text-xs font-bold border border-info/30">
                    Solicitação enviada
                </button>
            );
        }
        if (status === 'PENDING' && direction === 'RECEIVED') {
            return (
                <button
                    onClick={acceptRequest}
                    disabled={friendLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-bold hover:bg-success/80 transition-colors active:scale-95"
                >
                    {friendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    Aceitar Solicitação
                </button>
            );
        }
        return (
            <button
                onClick={sendFriendRequest}
                disabled={friendLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-bold hover:bg-accent-secondary transition-colors active:scale-95"
            >
                {friendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Adicionar Amigo
            </button>
        );
    };

    const maxSubjectHours = profile.subjectStats?.length > 0
        ? Math.max(...profile.subjectStats.map((s: any) => s.hours))
        : 0;

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'achievements', label: 'Conquistas', icon: Trophy },
        { key: 'subjects', label: 'Matérias', icon: BookOpen },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Hero */}
            <div className="bg-background-surface border border-border-subtle rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full border-[3px] border-accent-primary shadow-[0_0_20px_rgba(var(--accent-glow),0.3)] overflow-hidden bg-background-elevated flex items-center justify-center">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-text-muted">
                                    {profile.username?.slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <LevelBadge level={profile.level} size="sm" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {profile.name && (
                            <h1 className="text-xl font-bold text-text-primary font-display truncate">
                                {profile.name}
                            </h1>
                        )}
                        <p className={`${profile.name ? 'text-sm text-text-secondary' : 'text-xl font-bold text-text-primary font-display'} truncate`}>
                            {profile.name ? `@${profile.username}` : profile.username}
                        </p>
                        <p className="text-sm text-accent-primary font-bold mt-0.5">
                            ⚡ {profile.title} — Nível {profile.level}
                        </p>
                        {profile.institution && (
                            <p className="text-xs text-text-muted mt-1 truncate">
                                🏛️ {profile.institution.shortName || profile.institution.name}
                                {profile.course && ` · ${profile.course.name}`}
                            </p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 shrink-0">
                        {getFriendButton()}
                        {!isOwnProfile && (
                            <button
                                onClick={() => router.push('/chat')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-elevated border border-border-subtle text-text-secondary text-xs font-bold hover:text-accent-primary hover:border-accent-primary transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5" /> Mensagem
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                        { icon: Clock, label: 'Horas', value: `${profile.stats.totalStudyHours}h` },
                        { icon: Trophy, label: 'Conquistas', value: `${profile.stats.achievementsUnlocked}/${profile.stats.totalAchievements}` },
                        { icon: BookOpen, label: 'Sessões', value: profile.stats.totalSessions },
                    ].map((stat, i) => (
                        <div key={i} className="bg-background-base rounded-xl border border-border-subtle p-3 text-center">
                            <stat.icon className="w-4 h-4 text-accent-primary mx-auto mb-1" />
                            <p className="text-lg font-bold font-mono text-text-primary">{stat.value}</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
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
                            Nenhuma conquista disponível.
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
                            Nenhuma matéria estudada ainda.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
