'use client';

import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
    id: string;
    username: string;
    email: string;
    level: number;
    xp: number;
    title: string;
    streak: number;
    avatarUrl?: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (emailOrUsername: string, password: string) => Promise<void>;
    logout: () => void;
    loadSession: () => Promise<void>;
    setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (emailOrUsername: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailOrUsername, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || data.message || 'Falha no login');
        }

        const data = await res.json();
        localStorage.setItem('sq-token', data.accessToken);
        set({ token: data.accessToken, isAuthenticated: true, user: data.user || null });
    },

    logout: () => {
        localStorage.removeItem('sq-token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    setToken: (token: string) => {
        localStorage.setItem('sq-token', token);
        set({ token });
    },

    loadSession: async () => {
        const token = localStorage.getItem('sq-token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false, user: null, token: null });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                localStorage.removeItem('sq-token');
                set({ isLoading: false, isAuthenticated: false, user: null, token: null });
                return;
            }

            const user = await res.json();
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
            localStorage.removeItem('sq-token');
            set({ isLoading: false, isAuthenticated: false, user: null, token: null });
        }
    },
}));
