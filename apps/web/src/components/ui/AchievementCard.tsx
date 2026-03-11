'use client';

import { Lock } from 'lucide-react';
import Image from 'next/image';

const ACHIEVEMENT_ICONS: Record<string, string> = {
    // Study hours
    study_1h: '/assets/achievements/primeiros-passos.png',
    study_10h: '/assets/achievements/dedicacao.png',
    study_50h: '/assets/achievements/focado.png',
    study_100h: '/assets/achievements/sabio.png',
    study_500h: '/assets/achievements/lenda-viva.png',
    // Subject mastery
    subject_10h: '/assets/achievements/foco-inicial.png',
    subject_50h: '/assets/achievements/especialista.png',
    subject_100h: '/assets/achievements/mestre-da-materia.png',
    calculus_100h: '/assets/achievements/calculista.png',
    // Challenges
    marathon: '/assets/achievements/maratonista.png',
    night_owl: '/assets/achievements/insone.png',
    early_bird: '/assets/achievements/madrugador.png',
    // Pomodoro
    pomodoro_10: '/assets/achievements/foco-no-tomate.png',
    pomodoro_100: '/assets/achievements/maquina-de-foco.png',
    // Uploads
    first_upload: '/assets/achievements/contribuidor-iniciante.png',
    upload_10: '/assets/achievements/ajudante.png',
    upload_50: '/assets/achievements/bibliotecario.png',
    // Forum
    first_reply: '/assets/achievements/ajudando-proximo.png',
    accepted_5: '/assets/achievements/solucionador.png',
    accepted_50: '/assets/achievements/professor.png',
    // Social
    friends_1: '/assets/achievements/nao-estamos-sos.png',
    friends_10: '/assets/achievements/sociavel.png',
    // Streaks
    streak_3: '/assets/achievements/rotina.png',
    streak_7: '/assets/achievements/semana-perfeita.png',
    streak_30: '/assets/achievements/habito-de-ferro.png',
    streak_100: '/assets/achievements/imparavel.png',
    // Ranking
    rank_top100: '/assets/achievements/elite-100.png',
    rank_top10: '/assets/achievements/top-10.png',
    rank_1: '/assets/achievements/o-melhor.png',
    // Legacy keys (fallback name-based slugs)
    calculista: '/assets/achievements/calculista.png',
    maratonista: '/assets/achievements/maratonista.png',
    insone: '/assets/achievements/insone.png',
    solucionador: '/assets/achievements/solucionador.png',
    sociavel: '/assets/achievements/sociavel.png',
    compartilhador: '/assets/achievements/compartilhador.png',
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
    const imgSrc = ACHIEVEMENT_ICONS[slugKey] || '/assets/achievements/default.png'; // fallback to default if missing
    return (
        <div
            className={`group relative p-4 rounded-xl border transition-all duration-300 ${unlocked
                ? 'bg-background-surface border-accent-primary/40 shadow-[0_0_15px_rgba(var(--accent-glow),0.15)] hover:shadow-[0_0_25px_rgba(var(--accent-glow),0.3)] hover:border-accent-primary'
                : 'bg-background-base border-border-subtle hover:opacity-100' // wrapper opacity removed to avoid entire card greying out too much
                }`}
        >
            {/* Emoji / Lock */}
            <div className="flex items-center gap-3 mb-2">
                <div
                    className={`w-12 h-12 flex items-center justify-center shrink-0 ${unlocked
                        ? 'drop-shadow-[0_0_8px_rgba(var(--accent-glow),0.4)]'
                        : '' // Removed bg-background-elevated to ensure transparency
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
                            className="w-full h-full object-contain opacity-40 grayscale"
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
