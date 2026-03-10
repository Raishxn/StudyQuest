'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { fetchBankItemById, rateBankItem, addBankComment } from '../../../../lib/api/bank';
import { Loader2, Download, Star, MessageSquare, ChevronLeft, ChevronRight, File, ArrowBigUp } from 'lucide-react';
import { toast } from 'sonner';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function BankItemViewPage() {
    const { examId } = useParams() as { examId: string };
    const queryClient = useQueryClient();

    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [commentText, setCommentText] = useState('');

    const { data: item, isLoading, error } = useQuery({
        queryKey: ['bank-item', examId],
        queryFn: () => fetchBankItemById(examId),
    });

    const rateMutation = useMutation({
        mutationFn: (score: number) => rateBankItem(examId, score),
        onSuccess: () => {
            toast.success('Avaliação registrada!');
            queryClient.invalidateQueries({ queryKey: ['bank-item', examId] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const commentMutation = useMutation({
        mutationFn: (body: string) => addBankComment(examId, body),
        onSuccess: () => {
            setCommentText('');
            toast.success('Comentário enviado!');
            queryClient.invalidateQueries({ queryKey: ['bank-item', examId] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-accent-primary" /></div>;
    if (error || !item) return <div className="text-center p-20 text-danger font-bold">Erro ao carregar material.</div>;

    const isPdf = item.downloadUrl.toLowerCase().includes('.pdf') || item.downloadUrl.includes('application/pdf') || (!item.downloadUrl.match(/\.(jpeg|jpg|gif|png)$/) && true); // Fallback best guess

    return (
        <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column - Viewer */}
            <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Visualizer Frame */}
                <div className="bg-background-surface border border-border-strong rounded-2xl overflow-hidden flex flex-col shadow-xl">
                    <div className="bg-background-elevated border-b border-border-subtle p-4 flex justify-between items-center">
                        <h2 className="font-bold text-text-primary flex items-center gap-2">
                            <File className="w-5 h-5 text-accent-primary" />
                            {isPdf ? 'Visualizador de PDF' : 'Visualizador de Imagem'}
                        </h2>
                        <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:text-accent-secondary bg-accent-primary/10 px-4 py-2 rounded-xl transition-colors"
                        >
                            <Download className="w-4 h-4" /> Original
                        </a>
                    </div>

                    <div className="bg-[#e4e4e7] dark:bg-[#18181b] min-h-[600px] flex items-center justify-center overflow-auto p-4 relative">
                        {isPdf ? (
                            <Document
                                file={item.downloadUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<Loader2 className="w-8 h-8 animate-spin text-accent-primary" />}
                                className="shadow-2xl mx-auto"
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="max-w-full"
                                />
                            </Document>
                        ) : (
                            <img src={item.downloadUrl} alt="Documento" className="max-w-full h-auto shadow-2xl rounded" />
                        )}
                    </div>

                    {isPdf && numPages > 0 && (
                        <div className="bg-background-elevated border-t border-border-subtle p-3 flex justify-center items-center gap-4">
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                className="p-2 bg-background-base rounded-lg border border-border-subtle disabled:opacity-50 hover:border-accent-primary transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-bold text-text-primary">
                                Página {pageNumber} de {numPages}
                            </span>
                            <button
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                                className="p-2 bg-background-base rounded-lg border border-border-subtle disabled:opacity-50 hover:border-accent-primary transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Right Column - Meta & Comments */}
            <div className="flex flex-col gap-6">

                {/* Meta Box */}
                <div className="bg-background-surface border border-border-strong rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded">
                            {item.subject}
                        </span>
                        <span className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h1 className="text-2xl font-black text-text-primary leading-tight mb-4">{item.title}</h1>

                    <div className="space-y-2 mb-6 text-sm">
                        <div className="flex justify-between border-b border-border-dashed pb-2">
                            <span className="text-text-muted">Enviado por</span>
                            <span className="font-bold text-text-primary">@{item.uploader?.username}</span>
                        </div>
                        <div className="flex justify-between border-b border-border-dashed pb-2">
                            <span className="text-text-muted">Professor</span>
                            <span className="font-bold text-text-primary">{item.professor || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-border-dashed pb-2">
                            <span className="text-text-muted">Período</span>
                            <span className="font-bold text-text-primary">{item.period || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Interactive Rating */}
                    <div className="pt-4 border-t border-border-subtle">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-text-primary">Avaliação Média</span>
                            <div className="flex items-center gap-1 text-amber-500 font-black">
                                <Star className="w-4 h-4 fill-current" /> {item.rating.toFixed(1)} <span className="text-text-muted text-xs font-normal">({item.ratingCount})</span>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted mb-3 flex items-center justify-between">Deixe sua nota para este material: {rateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    disabled={rateMutation.isPending}
                                    onClick={() => rateMutation.mutate(star)}
                                    className="flex-1 py-1.5 flex justify-center items-center bg-background-base border border-border-strong hover:border-amber-500 hover:text-amber-500 rounded-lg transition-colors group"
                                    title={`Dar ${star} estrela${star > 1 ? 's' : ''}`}
                                >
                                    <Star className="w-4 h-4 text-text-muted group-hover:fill-amber-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-background-surface border border-border-strong rounded-2xl p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5" />
                        Discussão ({item.comments?.length || 0})
                    </h3>

                    {/* Input */}
                    <div className="bg-background-base border border-border-strong rounded-xl outline-offset-2 focus-within:ring-2 focus-within:ring-accent-primary mb-6 transition-all">
                        <textarea
                            rows={3}
                            disabled={commentMutation.isPending}
                            className="w-full bg-transparent p-3 outline-none text-text-primary resize-y text-sm"
                            placeholder="Tem alguma dúvida ou resolução alternativa?"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end p-2 border-t border-border-subtle">
                            <button
                                disabled={!commentText.trim() || commentMutation.isPending}
                                onClick={() => commentMutation.mutate(commentText)}
                                className="bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {commentMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                                Enviar
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        {item.comments?.map((comment: any, idx: number) => (
                            <div key={comment.id} className={`flex gap-3 pb-4 ${idx !== item.comments.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                                <img src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.username}`} alt="avatar" className="w-8 h-8 rounded-full border border-border-strong" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-text-primary text-sm">@{comment.author?.username}</span>
                                        <span className="text-[10px] text-text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{comment.body}</p>
                                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-text-muted cursor-pointer hover:text-accent-primary transition-colors">
                                        <ArrowBigUp className="w-4 h-4" /> {comment.upvotes}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!item.comments || item.comments.length === 0) && (
                            <div className="text-center py-8 text-text-muted text-sm border border-border-dashed rounded-xl">
                                Ninguém comentou ainda.<br />Seja o primeiro!
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
