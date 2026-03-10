import Link from 'next/link';
import { MessageSquare, ArrowBigUp, CheckCircle, HelpCircle } from 'lucide-react';

interface PostCardProps {
    post: any;
    onUpvote?: (id: string) => void;
}

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `agora mesmo`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays}d`;
}

export function PostCard({ post, onUpvote }: PostCardProps) {
    const isSolved = post.solved;
    const postedAt = timeAgo(post.createdAt);

    return (
        <div className="bg-background-surface border border-border-subtle hover:border-accent-primary/50 transition-colors rounded-xl p-4 flex gap-4">
            {/* Upvotes Column */}
            <div className="flex flex-col items-center justify-start pt-1 gap-1">
                <button
                    onClick={(e) => { e.preventDefault(); onUpvote?.(post.id); }}
                    className="text-text-muted hover:text-accent-primary transition-colors p-1"
                    title="Votar"
                >
                    <ArrowBigUp className="w-6 h-6" />
                </button>
                <span className="font-bold text-text-primary text-sm">{post.upvotes}</span>
            </div>

            {/* Content Column */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    {isSolved ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                            <CheckCircle className="w-3 h-3" /> RESOLVIDA
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <HelpCircle className="w-3 h-3" /> SEM RESPOSTA
                        </span>
                    )}
                    <span className="text-xs font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-full">
                        {post.subject}
                    </span>
                    {post.tags?.map((tag: string) => (
                        <span key={tag} className="text-xs text-text-muted bg-background-base px-2 py-0.5 rounded-full border border-border-subtle">
                            {tag}
                        </span>
                    ))}
                </div>

                <Link href={`/forum/${post.id}`} className="text-lg font-bold text-text-primary hover:text-accent-primary transition-colors line-clamp-2">
                    {post.title}
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                    <span className="flex items-center gap-1">
                        <span className="font-medium text-text-secondary">@{post.author?.username}</span>
                    </span>
                    <span>•</span>
                    <span>{postedAt}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post._count?.replies || 0} respostas
                    </span>
                </div>
            </div>
        </div>
    );
}
