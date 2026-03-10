'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/authStore';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await login(emailOrUsername, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Falha ao fazer login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-base flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">

                {/* Branding */}
                <div className="flex flex-col items-center justify-center mb-8 text-accent-primary">
                    <div className="w-16 h-16 bg-background-surface border border-accent-muted rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Swords className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-cinzel)] uppercase tracking-widest drop-shadow-sm">
                        StudyQuest
                    </h1>
                    <p className="text-text-muted mt-2 text-center text-sm">
                        Sua jornada acadêmica transformada em uma aventura épica.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-background-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-text-primary text-center mb-6">Entrar na sua conta</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="bg-danger/20 text-danger border border-danger/50 p-3 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email ou Username</label>
                                <input
                                    type="text"
                                    required
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    className="w-full bg-background-base border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="usuario@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Senha</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background-base border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-2 w-full py-3 bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-background-elevated border-t border-border-subtle text-center">
                        <p className="text-sm text-text-secondary">
                            Não tem uma conta? <Link href="/register" className="text-accent-primary font-bold hover:underline">Cadastre-se</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
