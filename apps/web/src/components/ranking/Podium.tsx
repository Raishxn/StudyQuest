'use client';

import React from 'react';
import Image from 'next/image';
import { Trophy, Star, Award } from 'lucide-react';

interface PodiumUser {
    id: string;
    username: string;
    avatarUrl?: string;
    level: number;
    xp: number;
    title?: string;
}

interface PodiumProps {
    top3: PodiumUser[];
}

export const Podium: React.FC<PodiumProps> = ({ top3 }) => {
    const [first, second, third] = top3;

    const renderRank = (user: PodiumUser | undefined, position: 1 | 2 | 3) => {
        if (!user) return <div className="flex-1 opacity-0" />;

        const configs = {
            1: {
                height: 'h-64 sm:h-72',
                color: 'from-yellow-400 to-yellow-600',
                borderColor: 'border-yellow-500/50',
                glow: 'shadow-[0_0_30px_-5px_hsl(var(--warning))]',
                icon: <Trophy className="w-8 h-8 text-yellow-400" />,
                avatarSize: 'w-24 h-24 sm:w-28 sm:h-28',
            },
            2: {
                height: 'h-52 sm:h-60',
                color: 'from-slate-300 to-slate-500',
                borderColor: 'border-slate-400/50',
                glow: 'shadow-lg',
                icon: <Award className="w-6 h-6 text-slate-300" />,
                avatarSize: 'w-20 h-20 sm:w-24 sm:h-24',
            },
            3: {
                height: 'h-40 sm:h-48',
                color: 'from-orange-400 to-orange-600',
                borderColor: 'border-orange-500/50',
                glow: 'shadow-md',
                icon: <Star className="w-6 h-6 text-orange-400" />,
                avatarSize: 'w-16 h-16 sm:w-20 sm:h-20',
            },
        };

        const config = configs[position];

        return (
            <div className={`flex flex-col items-center flex-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-10 ${position === 1 ? 'z-10 -mt-8' : 'z-0'}`}>
                <div className="relative mb-4 group">
                    <div className={`relative ${config.avatarSize} rounded-full overflow-hidden border-4 ${config.borderColor} ${config.glow} transition-transform group-hover:scale-105 duration-300`}>
                        <Image
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.username}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-bg-surface border border-border-subtle rounded-full p-1.5 shadow-lg">
                        {config.icon}
                    </div>
                </div>

                <div className="text-center mb-2 px-2">
                    <p className="font-display text-sm sm:text-base font-bold truncate max-w-[120px]">{user.username}</p>
                    <p className="text-xs text-text-secondary font-medium tracking-tight uppercase opacity-80">{user.title || 'Novato'}</p>
                </div>

                <div className={`w-full ${config.height} rounded-t-2xl bg-gradient-to-b ${config.color} border-x border-t ${config.borderColor} flex flex-col items-center pt-4 relative overflow-hidden group/podium`}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/podium:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-4xl sm:text-6xl font-display font-black text-white/20 select-none">#{position}</span>
                    <div className="mt-auto pb-4 bg-black/20 w-full text-center py-2">
                        <p className="text-white font-mono text-sm sm:text-base font-bold">{user.xp.toLocaleString()} XP</p>
                        <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Nível {user.level}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center gap-1 sm:gap-4 px-2 sm:px-4 py-12 max-w-4xl mx-auto min-h-[400px]">
            {renderRank(second, 2)}
            {renderRank(first, 1)}
            {renderRank(third, 3)}
        </div>
    );
};
