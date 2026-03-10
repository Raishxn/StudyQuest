'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { Loader2, Building, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Institution {
    id: string;
    name: string;
    shortName: string | null;
    state: string;
}

interface Course {
    id: string;
    name: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setToken = useAuthStore((s) => s.setToken);
    const loadSession = useAuthStore((s) => s.loadSession);

    const [instSearch, setInstSearch] = useState('');
    const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [unidade, setUnidade] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Handle Initial Token load
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setToken(token);
        }
    }, [searchParams, setToken]);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(instSearch), 300);
        return () => clearTimeout(handler);
    }, [instSearch]);

    const { data: institutions, isLoading: loadingInst } = useQuery<Institution[]>({
        queryKey: ['institutions', debouncedSearch],
        queryFn: async () => {
            const qs = debouncedSearch.length >= 2 ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
            const res = await fetch(`${API_URL}/institutions${qs}`);
            if (!res.ok) throw new Error('Falha ao carregar');
            return res.json();
        },
        staleTime: 60000,
    });

    const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
        queryKey: ['courses', selectedInst?.id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/institutions/${selectedInst?.id}/courses`);
            if (!res.ok) throw new Error('Falha');
            return res.json();
        },
        enabled: !!selectedInst?.id,
        staleTime: 60000,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInst || !selectedCourse || !unidade) {
            setError('Complete todos os passos para continuar.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    institutionId: selectedInst.id,
                    courseId: selectedCourse.id,
                    unidade,
                })
            });

            if (!res.ok) throw new Error('Erro ao salvar dados acadêmicos.');

            await loadSession();
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-base flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-background-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden p-6">
                <h2 className="text-xl font-bold text-text-primary text-center mb-2">Quase lá!</h2>
                <p className="text-sm text-center text-text-muted mb-6">Complete seu perfil acadêmico para começar sua aventura.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && <div className="bg-danger/20 text-danger p-3 rounded-lg text-sm text-center">{error}</div>}

                    {/* Institution Selection */}
                    <div className="relative border border-border-strong rounded-xl p-4 bg-background-surface/50">
                        <h4 className="text-sm font-bold text-accent-primary mb-3 flex items-center gap-2">
                            <Building className="w-4 h-4" /> Qual é a sua Faculdade?
                        </h4>
                        {!selectedInst ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar ex: USP, FATEC..."
                                    value={instSearch} onChange={e => setInstSearch(e.target.value)}
                                    className="w-full bg-background-base border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                />
                                <div className="absolute z-10 w-full mt-1 bg-background-elevated border border-border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {loadingInst ? (
                                        <div className="p-3 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                                    ) : (
                                        institutions?.map(inst => (
                                            <button
                                                type="button"
                                                key={inst.id}
                                                onClick={() => setSelectedInst(inst)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-background-surface border-b border-border-subtle last:border-0 truncate"
                                            >
                                                <span className="font-bold text-text-primary mr-2">{inst.shortName || inst.name}</span>
                                                <span className="text-text-muted text-xs">({inst.state})</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between p-3 border border-border-subtle rounded-lg bg-background-base items-center">
                                <span className="text-sm font-bold truncate">{selectedInst.name}</span>
                                <button type="button" onClick={() => setSelectedInst(null)} className="text-xs text-accent-primary">Trocar</button>
                            </div>
                        )}
                    </div>

                    {/* Course Selection */}
                    {selectedInst && (
                        <div className="relative border border-border-strong rounded-xl p-4 bg-background-surface/50">
                            <h4 className="text-sm font-bold text-accent-primary mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Qual é o seu Curso?
                            </h4>
                            <select
                                required
                                value={selectedCourse?.id || ''}
                                onChange={e => setSelectedCourse(courses?.find(c => c.id === e.target.value) || null)}
                                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-accent-primary"
                            >
                                <option value="" disabled>Selecione um curso...</option>
                                {courses?.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Campus Selection */}
                    {selectedCourse && (
                        <div className="relative border border-border-strong rounded-xl p-4 bg-background-surface/50">
                            <h4 className="text-sm font-bold text-accent-primary mb-3 flex items-center gap-2">
                                <Building className="w-4 h-4" /> Unidade/Campus
                            </h4>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Polo Interlagos, Centro..."
                                value={unidade}
                                onChange={e => setUnidade(e.target.value)}
                                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-accent-primary"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedInst || !selectedCourse || !unidade}
                        className="mt-4 w-full py-3 bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex justify-center"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
}
