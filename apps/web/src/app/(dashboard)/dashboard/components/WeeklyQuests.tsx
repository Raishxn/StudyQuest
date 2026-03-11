'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getWeeklyMissions } from '@/lib/api/missions';

export function WeeklyQuests() {
    const { data: missions = [], isLoading } = useQuery({
        queryKey: ['missions', 'weekly'],
        queryFn: getWeeklyMissions,
    });
    return (
        <div className="bg-background-surface border border-border-subtle rounded-xl p-4 lg:p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">
                    Missões da Semana
                </h2>
            </div>

            <div className="space-y-4 flex-1">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse h-20 bg-background-elevated rounded-lg border border-border-subtle" />
                        ))}
                    </div>
                ) : missions.map((quest: any, idx: number) => {
                    const isCompleted = quest.completed;
                    const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

                    return (
                        <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-lg border ${isCompleted
                                ? 'bg-success/5 border-success/20'
                                : 'bg-background-base border-border-subtle'
                                } flex flex-col gap-2 relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`font-semibold text-sm ${isCompleted ? 'text-success' : 'text-text-primary'}`}>
                                    {quest.title}
                                </span>

                                {isCompleted ? (
                                    <span className="flex items-center text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Concluída
                                    </span>
                                ) : (
                                    <span className="text-xs font-mono font-medium text-text-muted">
                                        {quest.progress}/{quest.target} {quest.unit === 'minutes' ? 'min' : quest.unit}
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden mt-1">
                                <motion.div
                                    className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-accent-primary'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-xs text-text-muted mt-4 text-center italic">
                *Novas missões são geradas toda segunda-feira.
            </p>
        </div>
    );
}
