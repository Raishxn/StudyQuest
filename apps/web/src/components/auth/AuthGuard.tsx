'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { Loader2, Swords } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoading, isAuthenticated, loadSession } = useAuthStore();

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // While loading, show a full-screen spinner
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-base flex flex-col items-center justify-center gap-4">
                <Swords className="w-12 h-12 text-accent-primary animate-pulse" />
                <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
            </div>
        );
    }

    const isPublicPath = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

    // Authenticated user on a public page (login/register) → redirect to dashboard
    if (isAuthenticated && isPublicPath) {
        router.replace('/dashboard');
        return null;
    }

    // Unauthenticated user on a protected page → redirect to login
    if (!isAuthenticated && !isPublicPath) {
        router.replace('/login');
        return null;
    }

    return <>{children}</>;
}
