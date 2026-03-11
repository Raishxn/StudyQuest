'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBankItems } from '../../../../lib/api/bank';
import { motion } from 'framer-motion';
import { Folder, Clock, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecentBankUploads() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['recentBankUploads'],
        // fetch without subject filter to get latest global or we could pass user's course if we had it
        // Using sort: 'recent' assuming API supports sorting, if not just fetches default
        queryFn: () => fetchBankItems({ sort: 'recent' }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const uploads = data?.data || [];
    const recentUploads = uploads.slice(0, 3); // Take top 3

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-background-surface border border-border-subtle rounded-xl p-4 lg:p-6 shadow-sm flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-accent-primary" />
                    <h2 className="text-lg font-bold font-[family-name:var(--font-cinzel)] text-text-primary tracking-wide">
                        Últimos Materiais
                    </h2>
                </div>
                <Link
                    href="/bank"
                    className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors"
                >
                    Ver acervo <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-3 border border-border-subtle rounded-lg bg-background-elevated/50">
                            <div className="w-10 h-10 bg-background-base rounded bg-accent-primary/10"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-background-base rounded w-3/4"></div>
                                <div className="h-3 bg-background-base rounded w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : isError || recentUploads.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted py-8 text-center bg-background-elevated/30 rounded-lg border border-dashed border-border-subtle">
                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm px-4">Nenhum material compartilhado recentemente.</p>
                    </div>
                ) : (
                    recentUploads.map((item: any, idx: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (idx * 0.1) }}
                            className="p-3 lg:p-4 rounded-lg border border-border-subtle bg-background-base hover:bg-background-elevated transition-colors group flex items-start gap-3"
                        >
                            <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary shrink-0 mt-0.5 border border-accent-primary/20">
                                <FileText className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start gap-2">
                                    <Link href={`/bank?item=${item.id}`} className="font-semibold text-text-primary hover:text-accent-primary truncate transition-colors" title={item.title}>
                                        {item.title}
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-1">
                                    <span className="font-medium text-accent-primary/80 bg-accent-primary/10 px-1.5 py-0.5 rounded">
                                        {item.subject}
                                    </span>
                                    <span className="flex items-center gap-1 shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <p className="text-xs text-text-muted mt-4 text-center italic">
                Contribua enviando materiais da sua turma.
            </p>
        </motion.div>
    );
}
