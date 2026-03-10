'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface RankingUser {
    id: string;
    username: string;
    avatarUrl?: string;
    level: number;
    xp: number;
    title?: string;
    rank: number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
}

interface RankingListProps {
    users: RankingUser[];
    currentUserId?: string;
}

export const RankingList: React.FC<RankingListProps> = ({ users, currentUserId }) => {
    return (
        <div className="space-y-2 max-w-4xl mx-auto px-2 pb-24">
            {users.map((user, index) => {
                const isMe = user.id === currentUserId;

                return (
                    <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group
              ${isMe
                                ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_15px_-5px_rgba(var(--accent-primary),0.3)]'
                                : 'bg-bg-surface border-border-subtle hover:border-accent-primary/50 hover:bg-bg-elevated'
                            }`}
                    >
                        <div className="w-8 text-center font-mono font-bold text-text-secondary select-none">
                            {user.rank}
                        </div>

                        <div className="flex-shrink-0 flex items-center justify-center w-6">
                            {user.trend === 'up' && <ChevronUp className="w-4 h-4 text-success" />}
                            {user.trend === 'down' && <ChevronDown className="w-4 h-4 text-danger" />}
                            {(!user.trend || user.trend === 'neutral') && <Minus className="w-4 h-4 text-text-muted" />}
                        </div>

                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border-strong group-hover:scale-110 transition-transform">
                            <Image
                                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                alt={user.username}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className={`font-bold truncate ${isMe ? 'text-accent-primary' : 'text-text-primary'}`}>
                                    {user.username}
                                    {isMe && <span className="ml-2 text-[10px] uppercase tracking-tighter bg-accent-primary text-white px-1.5 py-0.5 rounded-full">Você</span>}
                                </p>
                            </div>
                            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold opacity-70">
                                {user.title || 'Novato'} • Nível {user.level}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="font-mono font-bold text-sm">{user.xp.toLocaleString()} XP</p>
                            <div className="w-24 h-1.5 bg-border-subtle rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-accent-primary"
                                    style={{ width: `${Math.min((user.xp % 1000) / 10, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            {users.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-2xl">
                    <p className="text-text-secondary font-medium">Nenhum estudioso nesta categoria ainda...</p>
                </div>
            )}
        </div>
    );
};
