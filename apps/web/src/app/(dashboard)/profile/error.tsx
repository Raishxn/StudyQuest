'use client';

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Profile Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-danger/10 text-danger p-4 rounded-full mb-4 border border-danger/20">
                <ShieldAlert className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-text-primary font-display mb-2">Algo deu errado!</h2>
            <p className="text-sm text-text-muted mb-6 max-w-md">
                Ocorreu um erro inesperado ao carregar seu perfil. Tente recarregar a página.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-bold rounded-lg transition-colors"
            >
                Tentar Novamente
            </button>
        </div>
    );
}
