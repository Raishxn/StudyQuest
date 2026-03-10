'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { fetchPostById, togglePostUpvote, createReply, toggleReplyUpvote, acceptReply } from '../../../../lib/api/forum';
import { Loader2, ArrowBigUp, CheckCircle, MessageSquare, Download, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


const replySchema = z.object({
    body: z.string().min(20, 'No mínimo 20 caracteres').max(5000, 'Máximo de 5000 caracteres'),
});

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return `agora`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `há ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h}h`;
    return `há ${Math.floor(h / 24)}d`;
}

// Simple component to format text with pre-wrap
function FormattedText({ text }: { text: string }) {
    // basic code block detection or just pre-wrap
    return <div className="text-text-primary whitespace-pre-wrap break-words">{text}</div>;
}

export default function PostDetailPage() {
    const { postId } = useParams() as { postId: string };
    const queryClient = useQueryClient();
    const router = useRouter();

    // Assuming there's a way to get currentUser. If store doesn't exist, we fallback to null
    // We'll use a mocked userId comparison if store doesn't expose it correctly.
    // The backend already validates ownership, so frontend is just for hiding/showing buttons.
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // In a real app we'd get this from useAuthStore or Context
    // let's grab it from local storage JWT if we want, or just wait for backend error
    // But ideally:
    useEffect(() => {
        try {
            const token = localStorage.getItem('sq-token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.sub);
            }
        } catch (e) { }
    }, []);

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['forum-post', postId],
        queryFn: () => fetchPostById(postId),
    });

    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
        resolver: zodResolver(replySchema),
        defaultValues: { body: '' }
    });

    const upvotePost = useMutation({
        mutationFn: togglePostUpvote,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-post', postId] }),
        onError: (err: any) => toast.error(err.message)
    });

    const upvoteReply = useMutation({
        mutationFn: toggleReplyUpvote,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-post', postId] }),
        onError: (err: any) => toast.error(err.message)
    });

    const markSolution = useMutation({
        mutationFn: acceptReply,
        onSuccess: () => {
            toast.success('Solução marcada!');
            queryClient.invalidateQueries({ queryKey: ['forum-post', postId] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const submitReply = useMutation({
        mutationFn: (data: { body: string }) => createReply(postId, data),
        onSuccess: () => {
            reset();
            toast.success('Resposta enviada!');
            queryClient.invalidateQueries({ queryKey: ['forum-post', postId] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>;
    if (error || !post) return <div className="text-center p-12 text-danger">Erro ao carregar o post.</div>;

    return (
        <div className="max-w-4xl mx-auto py-6 flex flex-col gap-6">

            {/* 1. O Post Principal */}
            <div className="bg-background-surface border border-border-strong rounded-2xl p-6 flex gap-6">
                {/* Upvotes */}
                <div className="flex flex-col items-center gap-2">
                    <button
                        disabled={upvotePost.isPending}
                        onClick={() => upvotePost.mutate(postId)}
                        className="text-text-muted hover:text-accent-primary p-2 bg-background-base rounded-full transition-colors active:scale-95 disabled:opacity-50"
                    >
                        <ArrowBigUp className="w-8 h-8" />
                    </button>
                    <span className="font-black text-lg text-text-primary">{post.upvotes}</span>
                </div>

                {/* Post Conteúdo */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-black text-text-primary leading-tight mb-2">{post.title}</h1>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {post.solved && (
                            <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> RESOLVIDA
                            </span>
                        )}
                        <span className="text-xs font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
                            {post.subject}
                        </span>
                        {post.tags?.map((tag: string) => (
                            <span key={tag} className="text-xs text-text-muted bg-background-base px-2 py-0.5 rounded-full border border-border-subtle">{tag}</span>
                        ))}
                    </div>

                    <div className="text-sm flex items-center gap-2 text-text-muted mb-6 pb-4 border-b border-border-subtle">
                        <img src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`} alt="avatar" className="w-6 h-6 rounded-full bg-background-base" />
                        <span className="font-bold text-text-secondary">{post.author?.username}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-background-elevated rounded font-bold text-accent-primary">Lvl {post.author?.level || 1}</span>
                        <span>•</span>
                        <span>{timeAgo(post.createdAt)}</span>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none">
                        <FormattedText text={post.body} />
                    </div>

                    {post.fileUrl && (
                        <div className="mt-6">
                            <a href={post.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-background-base border border-border-strong rounded-xl text-sm font-bold text-accent-primary hover:bg-background-elevated transition-colors">
                                <Download className="w-4 h-4" /> Baixar Anexo
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Respostas */}
            <div>
                <h3 className="text-xl font-black text-text-primary mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> {post.replies?.length || 0} Respostas
                </h3>

                <div className="flex flex-col gap-4">
                    {post.replies?.map((reply: any) => (
                        <div key={reply.id} className={`bg-background-surface border p-5 rounded-2xl flex gap-4 ${reply.isAccepted ? 'border-success shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-border-subtle'}`}>
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    disabled={upvoteReply.isPending}
                                    onClick={() => upvoteReply.mutate(reply.id)}
                                    className="text-text-muted hover:text-accent-primary"
                                >
                                    <ArrowBigUp className="w-6 h-6" />
                                </button>
                                <span className="font-bold text-sm text-text-primary">{reply.upvotes}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm flex items-center gap-2 text-text-muted">
                                        <img src={reply.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.username}`} alt="avatar" className="w-5 h-5 rounded-full bg-background-base" />
                                        <span className="font-bold text-text-secondary">{reply.author?.username}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-background-elevated rounded font-bold text-accent-primary">Lvl {reply.author?.level || 1}</span>
                                        <span>•</span>
                                        <span className="text-xs">{timeAgo(reply.createdAt)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        {reply.isAccepted && (
                                            <span className="text-success flex items-center gap-1 bg-success/10 px-2 py-1 rounded-lg">
                                                <CheckCircle className="w-3.5 h-3.5" /> Solução Aceita
                                            </span>
                                        )}
                                        {/* Se for o dono do post original, e esta não for a solução ainda */}
                                        {currentUserId === post.authorId && !reply.isAccepted && (
                                            <button
                                                onClick={() => markSolution.mutate(reply.id)}
                                                className="text-text-muted hover:text-success transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-success/10"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> Marcar Solução
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="prose prose-invert prose-sm max-w-none text-text-primary mt-2">
                                    <FormattedText text={reply.body} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {post.replies?.length === 0 && (
                        <div className="text-center py-10 bg-background-surface border border-border-subtle rounded-2xl">
                            <p className="text-text-muted">Ainda não há respostas. Seja o primeiro a ajudar!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Nova Resposta */}
            <div className="bg-background-elevated border border-border-strong p-6 rounded-2xl mt-4">
                <h4 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2"><Reply className="w-5 h-5 text-accent-primary" /> Sua Resposta</h4>
                <form onSubmit={handleSubmit((d) => submitReply.mutate(d))}>
                    <div className="border border-border-strong focus-within:border-accent-primary transition-colors rounded-xl overflow-hidden bg-background-base">
                        <textarea
                            {...register('body')}
                            rows={6}
                            className="w-full bg-transparent p-4 outline-none text-text-primary resize-y"
                            placeholder="Escreva sua resposta (min. 20 caracteres)..."
                        />
                    </div>
                    {errors.body && <p className="text-danger text-xs mt-1">{errors.body.message}</p>}

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={submitReply.isPending}
                            className="bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                        >
                            {submitReply.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Resposta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
