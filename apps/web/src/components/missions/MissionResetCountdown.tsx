'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function MissionResetCountdown() {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextMonday = new Date();
            nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
            nextMonday.setHours(0, 0, 0, 0);

            const diff = nextMonday.getTime() - now.getTime();
            if (diff <= 0) return 'Atualizando...';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            if (days > 0) return `${days}d ${hours}h`;
            return `${hours}h ${minutes}m`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Updates every minute

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-4 justify-center font-medium bg-background-elevated/50 py-1.5 px-3 rounded-full mx-auto w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Atualiza em: <span className="text-text-primary font-bold">{timeLeft}</span></span>
        </div>
    );
}
