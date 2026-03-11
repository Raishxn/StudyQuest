'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../../../../lib/api/forum';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export function RecentForumActivity() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['forumPosts', 'recent', 3],
        queryFn: () => fetchPosts({ sort: 'recent', limit: 3, solved: false }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const posts = data?.pages?.[0]?.posts || data?.posts || [];
    // Use slice(0, 3) in case backend doesn't support 'limit' properly yet
    const recentPosts = Array.isArray(posts) ? posts.slice(0, 3) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background-surface border border-border-subtle rounded-xl p-4 lg:p-6 shadow-sm flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent-primary" />
                    <h2 className="text-lg font-bold font-[family-name:var(--font-cinzel)] text-text-primary tracking-wide">
                        Fórum: Sem Resposta
                    </h2>
                </div>
                <Link
                    href="/forum"
                    className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors"
                >
                    Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex flex-col gap-2 p-3 border border-border-subtle rounded-lg bg-background-elevated/50">
                            <div className="h-4 bg-background-base rounded w-3/4"></div>
                            <div className="h-3 bg-background-base rounded w-1/4"></div>
                        </div>
                    ))
                ) : isError || recentPosts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted py-8 text-center bg-background-elevated/30 rounded-lg border border-dashed border-border-subtle">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma dúvida pendente no momento!</p>
                    </div>
                ) : (
                    recentPosts.map((post: any, idx: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="p-3 lg:p-4 rounded-lg border border-border-subtle bg-background-base hover:bg-background-elevated transition-colors group flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <Link href={`/forum/${post.id}`} className="font-semibold text-text-primary hover:text-accent-primary line-clamp-1 transition-colors">
                                    {post.title}
                                </Link>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-background-surface border border-border-subtle text-text-secondary whitespace-nowrap shrink-0">
                                    {post.subject}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-xs text-text-muted mt-1">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>Por {post.author?.username || 'Anônimo'}</span>
                                </div>

                                <Link
                                    href={`/forum/${post.id}#reply`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-primary font-medium hover:underline flex items-center gap-1"
                                >
                                    Responder <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
