'use client';

import { Lock } from 'lucide-react';
import Image from 'next/image';

const ACHIEVEMENT_ICONS: Record<string, string> = {
    calculista: '/assets/achievements/calculista.png',
    insone: '/assets/achievements/insone.png',
    maratonista: '/assets/achievements/maratonista.png',
    compartilhador: '/assets/achievements/compartilhador.png',
    solucionador: '/assets/achievements/solucionador.png',
    sociavel: '/assets/achievements/sociavel.png',
    lendario: '/assets/achievements/lendario.png',
    scholar_plus: '/assets/achievements/scholar-plus.png',
    fundador: '/assets/achievements/fundador.png',
    cavaleiro_da_guilda: '/assets/achievements/cavaleiro-da-guilda.png',
};

interface AchievementCardProps {
    id: string;
    name: string;
    description: string;
    iconEmoji?: string | null;
    xpReward: number;
    category: string;
    unlocked: boolean;
    unlockedAt?: string | null;
    achievementKey?: string;
}

export function AchievementCard({
    name,
    description,
    iconEmoji,
    xpReward,
    category,
    unlocked,
    unlockedAt,
    achievementKey,
}: AchievementCardProps) {
    const slugKey = achievementKey || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const imgSrc = ACHIEVEMENT_ICONS[slugKey] || '/assets/achievements/calculista.png'; // fallback to calculista as default if missing
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
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${unlocked
                        ? 'bg-transparent drop-shadow-[0_0_8px_rgba(var(--accent-glow),0.4)]'
                        : 'bg-background-elevated'
                        }`}
                >
                    {unlocked ? (
                        <Image
                            src={imgSrc}
                            alt={name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Image
                            src={imgSrc}
                            alt={name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain opacity-30 grayscale"
                        />
                    )}
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
