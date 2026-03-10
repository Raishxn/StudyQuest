'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadBankItem } from '../../../../lib/api/bank';
import { toast } from 'sonner';
import { UploadCloud, CheckCircle, Loader2, FileText, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const uploadSchema = z.object({
    title: z.string().min(10, 'Mínimo de 10 caracteres').max(150, 'Máximo de 150 caracteres'),
    type: z.string().min(1, 'Selecione o tipo'),
    subject: z.string().min(2, 'Informe a matéria'),
    professor: z.string().optional(),
    period: z.string()
        .optional()
        .refine((val) => !val || /^[0-9]{4}\.[1-2]$/.test(val), { message: 'Use YYYY.1 ou YYYY.2' }),
});

export default function UploadItemPage() {
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(uploadSchema),
        defaultValues: { title: '', type: 'EXAM', subject: '', professor: '', period: '' }
    });

    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) => uploadBankItem(formData),
        onSuccess: (data: any) => {
            toast.success('Material enviado com sucesso! +50 XP');
            queryClient.invalidateQueries({ queryKey: ['bank-items'] });
            router.push(`/bank/${data.id}`);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Erro ao enviar arquivo.');
        }
    });

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (file: File) => {
        if (file.size > 20 * 1024 * 1024) {
            toast.error('O arquivo não pode ser maior que 20MB.');
            return;
        }
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('Formato inválido. Aceito apenas PDF, JPEG, PNG ou WEBP.');
            return;
        }
        setFile(file);
    };

    const onSubmitMetadata = (data: any) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', data.title);
        formData.append('type', data.type);
        formData.append('subject', data.subject);
        if (data.professor) formData.append('professor', data.professor);
        if (data.period) formData.append('period', data.period);

        // Hardcoding institution and course for the MVP test wrapper
        // In full version, these would come from useStore or dynamic comboboxes 
        // populated from the API.
        formData.append('institutionId', 'placeholder_institutions_uuid');
        formData.append('courseId', 'placeholder_courses_uuid');

        uploadMutation.mutate(formData);
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-text-primary tracking-tight">Enviar Novo Material</h1>
                <p className="text-text-muted">Contribua com a comunidade e ganhe experiência épica!</p>
            </div>

            <div className="bg-background-surface border border-border-strong rounded-2xl p-8">

                {/* Step Indicator */}
                <div className="flex items-center gap-4 mb-8 text-sm font-bold">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-accent-primary' : 'text-text-muted'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-accent-primary/20' : 'bg-background-base'}`}>1</div>
                        <span>Arquivo</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-accent-primary' : 'text-text-muted'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-accent-primary/20' : 'bg-background-base'}`}>2</div>
                        <span>Metadados</span>
                    </div>
                </div>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${file ? 'border-success/50 bg-success/5' : 'border-border-strong hover:border-accent-primary/50 hover:bg-background-base'}`}
                            onClick={() => document.getElementById('fileUpload')?.click()}
                        >
                            <input type="file" id="fileUpload" className="hidden" accept=".pdf,.jpeg,.jpg,.png,.webp" onChange={handleFileSelect} />

                            {!file ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-background-elevated rounded-full flex items-center justify-center text-accent-primary">
                                        <UploadCloud className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-text-primary">Clique ou arraste o arquivo aqui</p>
                                        <p className="text-sm text-text-muted mt-1">PDF, JPG, PNG ou WEBP (Max 20MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-text-primary">{file.name}</p>
                                        <p className="text-sm text-text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="text-xs text-danger font-bold hover:underline"
                                    >
                                        Remover Arquivo
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                disabled={!file}
                                onClick={() => setStep(2)}
                                className="bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted disabled:text-neutral-400 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                            >
                                Avançar <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit(onSubmitMetadata)} className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="text-sm font-bold text-text-primary mb-2 block">Título Descritivo <span className="text-danger">*</span></label>
                                <input
                                    {...register('title')}
                                    className="w-full bg-background-base border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 text-text-primary"
                                    placeholder="Ex: Prova 1 de Cálculo (2023.2) - Modelo A"
                                />
                                {errors.title && <p className="text-xs text-danger mt-1">{String(errors.title.message)}</p>}
                            </div>

                            <div className="col-span-full">
                                <label className="text-sm font-bold text-text-primary mb-2 block">Tipo de Material <span className="text-danger">*</span></label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['EXAM', 'EXERCISE', 'ANSWER'].map(t => (
                                        <label key={t} className="cursor-pointer">
                                            <input type="radio" value={t} {...register('type')} className="peer hidden" />
                                            <div className="border border-border-strong rounded-xl p-4 text-center peer-checked:border-accent-primary peer-checked:bg-accent-primary/10 transition-all">
                                                <span className="block font-bold text-text-primary">{t === 'EXAM' ? 'Prova' : (t === 'ANSWER' ? 'Gabarito' : 'Lista')}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.type && <p className="text-xs text-danger mt-1">{String(errors.type.message)}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-bold text-text-primary mb-2 block">Disciplina <span className="text-danger">*</span></label>
                                <input
                                    {...register('subject')}
                                    className="w-full bg-background-base border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 text-text-primary"
                                    placeholder="Ex: Física Mecânica"
                                />
                                {errors.subject && <p className="text-xs text-danger mt-1">{String(errors.subject.message)}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-bold text-text-primary mb-2 block">Professor</label>
                                <input
                                    {...register('professor')}
                                    className="w-full bg-background-base border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 text-text-primary"
                                    placeholder="Opcional"
                                />
                            </div>

                            <div className="col-span-full md:col-span-1">
                                <label className="text-sm font-bold text-text-primary mb-2 block">Período Letivo</label>
                                <input
                                    {...register('period')}
                                    className="w-full bg-background-base border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 text-text-primary"
                                    placeholder="Ex: 2024.1"
                                />
                                {errors.period && <p className="text-xs text-danger mt-1">{String(errors.period.message)}</p>}
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-6">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-text-muted hover:text-text-primary font-bold px-4 py-2 transition-colors"
                            >
                                Voltar
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="text-xs font-bold text-accent-primary bg-accent-primary/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                    ✨ Ganhe +50 XP
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploadMutation.isPending}
                                    className="bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted disabled:text-neutral-400 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 flex items-center gap-2"
                                >
                                    {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Publicar Material</>}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
