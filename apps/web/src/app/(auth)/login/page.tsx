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
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight drop-shadow-sm">
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

                            <div className="relative mt-2 mb-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border-subtle"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-background-surface text-text-muted">Ou continue com</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`}
                                className="w-full py-3 bg-background-base border border-border-subtle hover:bg-background-elevated text-text-primary rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
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
