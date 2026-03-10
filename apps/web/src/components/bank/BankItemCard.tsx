import { Star, MessageSquare, FileText, CheckCircle, List } from 'lucide-react';
import Link from 'next/link';

interface BankItemCardProps {
    item: {
        id: string;
        title: string;
        type: string;
        subject: string;
        professor?: string;
        period?: string;
        rating: number;
        _count?: { comments: number };
        uploader?: { username: string };
    };
}

export function BankItemCard({ item }: BankItemCardProps) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'EXAM': return { icon: FileText, label: 'Prova', color: 'text-rose-500', bg: 'bg-rose-500/10' };
            case 'ANSWER': return { icon: CheckCircle, label: 'Gabarito', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'EXERCISE': return { icon: List, label: 'Lista', color: 'text-blue-500', bg: 'bg-blue-500/10' };
            default: return { icon: FileText, label: 'Arquivo', color: 'text-slate-500', bg: 'bg-slate-500/10' };
        }
    };

    const config = getTypeConfig(item.type);
    const Icon = config.icon;

    return (
        <Link href={`/bank/${item.id}`} className="block">
            <div className="bg-background-surface border border-border-subtle hover:border-accent-primary hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-2xl p-5 flex flex-col h-full group">

                <div className="flex justify-between items-start mb-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${config.color} ${config.bg}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {item.rating.toFixed(1)}
                    </div>
                </div>

                <h3 className="font-bold text-text-primary text-lg leading-tight mb-2 group-hover:text-accent-primary transition-colors line-clamp-2">
                    {item.title}
                </h3>

                <div className="mt-auto pt-4 flex flex-col gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-bold bg-background-elevated text-text-secondary px-2 py-0.5 rounded border border-border-strong">
                            {item.subject}
                        </span>
                        {item.period && (
                            <span className="text-xs text-text-muted border border-border-subtle px-2 py-0.5 rounded">
                                {item.period}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-muted mt-2 border-t border-border-subtle pt-3">
                        <span className="truncate max-w-[120px]">{item.professor || 'Prof. N/A'}</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {item._count?.comments || 0}
                            </span>
                            <span className="truncate max-w-[80px]">@{item.uploader?.username}</span>
                        </div>
                    </div>
                </div>

            </div>
        </Link>
    );
}
