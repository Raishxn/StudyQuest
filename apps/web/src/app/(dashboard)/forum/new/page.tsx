'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, X, Plus, ImageIcon, Bold, Italic, Code } from 'lucide-react';
import { toast } from 'sonner';
import { createPost } from '../../../../lib/api/forum';

const postSchema = z.object({
    title: z.string().min(10, 'O título deve ter no mínimo 10 caracteres').max(200, 'Máximo de 200 caracteres'),
    subject: z.string().min(1, 'Selecione uma matéria'),
    body: z.string().min(30, 'A descrição deve ter no mínimo 30 caracteres').max(10000, 'Máximo de 10000 caracteres'),
    tags: z.array(z.string()).default([]),
    fileUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function NewPostPage() {
    const router = useRouter();
    const [tagInput, setTagInput] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, getValues } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: { tags: [], subject: '' }
    });

    const tags = watch('tags');

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
        e.preventDefault();

        const value = tagInput.trim().replace(',', '');
        if (!value) return;

        if (tags.length >= 5) {
            toast.error('Máximo de 5 tags permitidas');
            return;
        }

        if (tags.includes(value.toLowerCase())) {
            setTagInput('');
            return;
        }

        setValue('tags', [...tags, value.toLowerCase()]);
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', tags.filter(t => t !== tagToRemove));
    };

    const onSubmit = async (data: PostFormData) => {
        try {
            const post = await createPost(data);
            toast.success('Pergunta publicada com sucesso!');
            router.push(`/forum/${post.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao criar pergunta');
        }
    };

    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('body-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = getValues('body') || '';

        const selectedText = currentVal.substring(start, end);
        const beforeText = currentVal.substring(0, start);
        const afterText = currentVal.substring(end);

        const newVal = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
        setValue('body', newVal, { shouldValidate: true });

        // Focus and restore cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    return (
        <div className="max-w-3xl mx-auto py-6">
            <h1 className="text-3xl font-black text-text-primary mb-2">Fazer uma Pergunta</h1>
            <p className="text-text-muted mb-8">Seja claro e objetivo para que a comunidade possa te ajudar da melhor forma.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-background-surface border border-border-subtle p-6 rounded-2xl">
                {/* Título */}
                <div>
                    <label className="block text-sm font-bold text-text-primary mb-1">Título da Pergunta <span className="text-danger">*</span></label>
                    <p className="text-xs text-text-muted mb-2">Resuma o seu problema ou dúvida em uma frase.</p>
                    <input
                        {...register('title')}
                        className="w-full bg-background-base border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                        placeholder="Ex: Como isolar o X nesta equação de segundo grau?"
                    />
                    {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matéria */}
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-1">Matéria <span className="text-danger">*</span></label>
                        <p className="text-xs text-text-muted mb-2">Selecione a área principal.</p>
                        <select
                            {...register('subject')}
                            className="w-full bg-background-base border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                        >
                            <option value="" disabled>Escolha uma matéria...</option>
                            <option value="Matemática">Matemática</option>
                            <option value="Física">Física</option>
                            <option value="Química">Química</option>
                            <option value="Biologia">Biologia</option>
                            <option value="História">História</option>
                            <option value="Geografia">Geografia</option>
                            <option value="Programação">Programação</option>
                            <option value="Outros">Outros</option>
                        </select>
                        {errors.subject && <p className="text-danger text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-1">Tags</label>
                        <p className="text-xs text-text-muted mb-2">Pressione Enter ou vírgula para adicionar (max 5).</p>
                        <div className="w-full bg-background-base border border-border-subtle rounded-lg p-2 focus-within:border-accent-primary transition-colors flex flex-wrap gap-2 items-center min-h-[50px]">
                            {tags.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 bg-background-surface border border-border-strong text-text-primary px-2 py-1 rounded-md text-xs font-medium">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="text-text-muted hover:text-danger"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                onBlur={handleAddTag}
                                placeholder={tags.length < 5 ? "Adicione tags..." : ""}
                                disabled={tags.length >= 5}
                                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-text-primary disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Corpo / Detalhes */}
                <div>
                    <label className="block text-sm font-bold text-text-primary mb-1">Detalhes da Dúvida <span className="text-danger">*</span></label>
                    <p className="text-xs text-text-muted mb-2">Descreva o contexto inteiro e o que você já tentou.</p>

                    <div className="border border-border-subtle rounded-lg overflow-hidden flex flex-col focus-within:border-accent-primary transition-colors">
                        {/* Toolbar */}
                        <div className="bg-background-surface/80 border-b border-border-subtle px-3 py-2 flex items-center gap-1">
                            <button type="button" onClick={() => insertFormatting('**', '**')} className="p-1.5 text-text-secondary hover:bg-background-elevated hover:text-text-primary rounded" title="Negrito"><Bold className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertFormatting('*', '*')} className="p-1.5 text-text-secondary hover:bg-background-elevated hover:text-text-primary rounded" title="Itálico"><Italic className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-border-strong mx-1" />
                            <button type="button" onClick={() => insertFormatting('`', '`')} className="p-1.5 text-text-secondary hover:bg-background-elevated hover:text-text-primary rounded" title="Código Inline"><Code className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertFormatting('\n```\n', '\n```\n')} className="p-1.5 text-text-secondary hover:bg-background-elevated hover:text-text-primary rounded" title="Bloco de Código"><Code className="w-4 h-4" /><span className="text-[10px] ml-1 font-bold">BLOCO</span></button>
                            <div className="flex-1" />
                            <button type="button" className="p-1.5 text-text-secondary hover:bg-background-elevated hover:text-accent-primary rounded flex items-center gap-1 text-xs font-bold" title="Anexar Imagem ou Arquivo" onClick={() => {
                                const url = prompt('Cole a URL da Imagem/Arquivo aqui:');
                                if (url) {
                                    insertFormatting(`![anexo](${url})`);
                                    setValue('fileUrl', url);
                                }
                            }}>
                                <ImageIcon className="w-4 h-4" /> Anexar
                            </button>
                        </div>
                        {/* Textarea */}
                        <textarea
                            id="body-textarea"
                            {...register('body')}
                            rows={10}
                            className="w-full bg-background-base p-4 text-text-primary outline-none resize-y"
                            placeholder="Escreva sua pergunta usando Markdown..."
                        />
                    </div>
                    {errors.body && <p className="text-danger text-xs mt-1">{errors.body.message}</p>}
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 border-t border-border-subtle">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-text-muted hover:text-text-primary font-bold mr-4"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar Pergunta'}
                    </button>
                </div>
            </form>
        </div>
    );
}
