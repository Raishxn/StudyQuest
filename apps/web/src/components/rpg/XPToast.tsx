'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Basic event emitter to trigger toasts globally (simplified for this example)
export const xpToastEvent = new EventTarget();

export function triggerXPToast(amount: number) {
  const event = new CustomEvent('xp-gained', { detail: { amount } });
  xpToastEvent.dispatchEvent(event);
}

export function XPToast() {
  const [toasts, setToasts] = useState<{ id: string; amount: number }[]>([]);

  useEffect(() => {
    const handleXP = (e: Event) => {
      const customEvent = e as CustomEvent<{ amount: number }>;
      const newToast = { id: Math.random().toString(36), amount: customEvent.detail.amount };
      setToasts((prev) => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    xpToastEvent.addEventListener('xp-gained', handleXP);
    return () => xpToastEvent.removeEventListener('xp-gained', handleXP);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="bg-background-elevated border border-accent-primary/50 shadow-[0_0_15px_rgba(var(--accent-glow),0.3)] rounded-full px-4 py-2 flex items-center justify-center pointer-events-auto"
          >
            <span className="font-mono font-bold text-accent-primary text-sm sm:text-base drop-shadow-sm">
              +{toast.amount} XP ⚡
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
