'use client';

import { useAuthStore } from '../../../../stores/authStore';
import { XPBar } from '../../../../components/rpg/XPBar';
import { motion } from 'framer-motion';

export function DashboardHeader() {
    const { user } = useAuthStore();

    const displayName = user?.username || 'Aventureiro';
    const displayLevel = user?.level || 1;
    const displayXP = user?.xp || 0;
    const displayTitle = user?.title || 'Pesquisador Iniciante';
    const displayStreak = user?.streak || 0;

    // Formatted as "Nível X — Título"
    const levelTitle = `Nível ${displayLevel} — ${displayTitle}`;

    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-background-surface border border-border-subtle rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative shadow-sm"
        >
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 w-full space-y-4 relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-display uppercase tracking-wide">
                        Bem-vindo de volta, {displayName} ⚔️
                    </h1>
                    {displayStreak > 0 && (
                        <div
                            className="flex items-center bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-orange-500 font-bold text-sm shadow-sm"
                            title={`${displayStreak} dias consecutivos de ofensiva!`}
                        >
                            🔥 {displayStreak} {displayStreak === 1 ? 'dia' : 'dias'}
                        </div>
                    )}
                </div>

                <div className="max-w-xl">
                    {/* We pass specific props for XP calculation (adjust formulas as needed to match the app's real progression) */}
                    <XPBar
                        currentXP={displayXP}
                        currentLevel={displayLevel}
                        xpForNextLevel={displayLevel * 600}
                        xpPreviousLevel={(displayLevel - 1) * 600}
                        title={levelTitle}
                    />
                </div>
            </div>
        </motion.section>
    );
}
