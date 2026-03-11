'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRanking } from '../../../../lib/api/ranking';
import { motion } from 'framer-motion';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FriendsRankingTop3() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['friendsRankingTop3'],
        queryFn: () => fetchRanking('friends', 'weekly'),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const friendsRanking = data?.top3 || [];

    return (
        <div className="bg-background-surface border border-border-subtle rounded-xl p-4 lg:p-6 shadow-sm flex flex-col h-full overflow-hidden relative">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">
                        Ranking de Amigos
                    </h2>
                </div>
                <Link
                    href="/ranking"
                    className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors"
                >
                    Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
                {isLoading ? (
                    <div className="flex items-end justify-center gap-2 lg:gap-4 h-32">
                        {[2, 1, 3].map((pos, i) => (
                            <div key={i} className={`animate-pulse bg-background-elevated rounded-t-lg w-16 lg:w-20 ${pos === 1 ? 'h-32' : pos === 2 ? 'h-24' : 'h-20'}`} />
                        ))}
                    </div>
                ) : isError || friendsRanking.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted py-6 text-center">
                        <Users className="w-8 h-8 mb-3 opacity-40 text-accent-primary" />
                        <p className="text-sm max-w-[200px] mb-4">
                            Você ainda não adicionou amigos para competir.
                        </p>
                        <Link
                            href="/profile?tab=friends"
                            className="text-sm font-semibold bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Adicionar Amigos
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-end justify-center gap-2 sm:gap-4 mt-8 pb-4">
                        {/* The returned array from API should ideally be ordered [1st, 2nd, 3rd] */}
                        {/* We will map them manually to visually show 2nd, 1st, 3rd podium order if there are at least 3, 
                otherwise just display them ascending */}

                        {friendsRanking.length >= 3 ? (
                            <>
                                {/* 2nd Place */}
                                <PodiumItem user={friendsRanking[1]} position={2} heightClass="h-24 lg:h-28" delay={0.2} colorClass="bg-gray-300 text-gray-800" />
                                {/* 1st Place */}
                                <PodiumItem user={friendsRanking[0]} position={1} heightClass="h-32 lg:h-36" delay={0.4} colorClass="bg-warning text-yellow-900" isFirst />
                                {/* 3rd Place */}
                                <PodiumItem user={friendsRanking[2]} position={3} heightClass="h-20 lg:h-24" delay={0.3} colorClass="bg-amber-700 text-orange-100" />
                            </>
                        ) : (
                            // Fallback for less than 3 friends
                            friendsRanking.map((user: any, index: number) => (
                                <PodiumItem
                                    key={user.id}
                                    user={user}
                                    position={index + 1}
                                    heightClass={index === 0 ? "h-32 lg:h-36" : "h-24 lg:h-28"}
                                    delay={0.2 * (index + 1)}
                                    colorClass={index === 0 ? "bg-warning text-yellow-900" : "bg-gray-300 text-gray-800"}
                                    isFirst={index === 0}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Background glow for podium */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-warning/5 blur-3xl rounded-t-full pointer-events-none" />
        </div>
    );
}

function PodiumItem({ user, position, heightClass, delay, colorClass, isFirst = false }: any) {
    if (!user) return <div className={`w-16 sm:w-20 ${heightClass} opacity-0`} />; // Invisible placeholder if array relies on it

    const initials = user.username ? user.username.substring(0, 2).toUpperCase() : '??';

    return (
        <div className="flex flex-col items-center group relative cursor-pointer" title={`${user.username} - ${user.xp} XP`}>
            {/* Avatar/Initials */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.2 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-2 flex items-center justify-center font-bold text-sm border-2 shadow-md relative z-10 bg-background-base ${isFirst ? 'border-warning w-12 h-12 sm:w-14 sm:h-14 -mt-4' : 'border-border-subtle'}`}
            >
                {initials}

                {/* Crown for 1st */}
                {isFirst && (
                    <div className="absolute -top-5 text-warning animate-bounce">
                        <Trophy className="w-5 h-5 fill-warning" />
                    </div>
                )}
            </motion.div>

            {/* Pillar */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ delay, duration: 0.8, type: 'spring' }}
                className={`w-16 sm:w-20 ${heightClass} ${colorClass} rounded-t-lg shadow-inner flex flex-col items-center justify-start pt-2 relative overflow-hidden`}
            >
                <span className="font-bold text-lg sm:text-xl font-display opacity-80">{position}º</span>
                <span className="text-[10px] sm:text-xs font-semibold px-1 w-full text-center truncate mt-auto mb-2 opacity-90">{user.username}</span>

                {/* Shimmer effect inside pillar */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </motion.div>
        </div>
    );
}
