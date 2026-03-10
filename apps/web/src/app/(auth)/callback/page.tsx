'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setToken = useAuthStore((s) => s.setToken);
    const loadSession = useAuthStore((s) => s.loadSession);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setToken(token);
            loadSession().then(() => {
                router.push('/dashboard');
            });
        } else {
            router.push('/login');
        }
    }, [searchParams, setToken, loadSession, router]);

    return (
        <div className="min-h-screen bg-background-base flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-text-muted">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Autenticando...</p>
            </div>
        </div>
    );
}
