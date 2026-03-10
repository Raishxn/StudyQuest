'use client';

import { Lock } from 'lucide-react';

interface AchievementCardProps {
    id: string;
    name: string;
    description: string;
    iconEmoji?: string | null;
    xpReward: number;
    category: string;
    unlocked: boolean;
    unlockedAt?: string | null;
}

export function AchievementCard({
    name,
    description,
    iconEmoji,
    xpReward,
    category,
    unlocked,
    unlockedAt,
}: AchievementCardProps) {
    return (
        <div
            className={`group relative p-4 rounded-xl border transition-all duration-300 ${unlocked
                    ? 'bg-background-surface border-accent-primary/40 shadow-[0_0_15px_rgba(var(--accent-glow),0.15)] hover:shadow-[0_0_25px_rgba(var(--accent-glow),0.3)] hover:border-accent-primary'
                    : 'bg-background-base border-border-subtle opacity-60 grayscale hover:opacity-80'
                }`}
        >
            {/* Emoji / Lock */}
            <div className="flex items-center gap-3 mb-2">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${unlocked
                            ? 'bg-accent-muted'
                            : 'bg-background-elevated'
                        }`}
                >
                    {unlocked ? (iconEmoji || '🏆') : <Lock className="w-4 h-4 text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                        {name}
                    </h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        {category}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className={`text-xs leading-relaxed ${unlocked ? 'text-text-secondary' : 'text-text-muted'}`}>
                {description}
            </p>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${unlocked ? 'text-accent-primary' : 'text-text-muted'}`}>
                    +{xpReward} XP
                </span>
                {unlocked && unlockedAt && (
                    <span className="text-[10px] text-text-muted">
                        {new Date(unlockedAt).toLocaleDateString('pt-BR')}
                    </span>
                )}
            </div>

            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-background-elevated border border-border-subtle rounded-lg shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-48 text-center">
                <p className="font-bold text-text-primary">{name}</p>
                <p className="text-text-muted mt-1">{description}</p>
                <p className="text-accent-primary font-mono font-bold mt-1">Recompensa: +{xpReward} XP</p>
            </div>
        </div>
    );
}
