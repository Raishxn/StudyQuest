'use client';

import { motion } from 'framer-motion';
import { LevelBadge } from './LevelBadge';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  oldTitle: string;
  newTitle: string;
  benefits?: string[];
  onClose: () => void;
}

export function LevelUpModal({ oldLevel, newLevel, oldTitle, newTitle, benefits = [], onClose }: LevelUpModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto timeout optionally
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--accent-glow),0.3)_0%,transparent_60%)]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative max-w-lg w-full bg-background-base/90 border border-accent-primary/40 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_40px_rgba(var(--accent-glow),0.4)] overflow-hidden"
      >
        <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl md:text-5xl font-display font-bold text-accent-primary mb-8 text-center drop-shadow-[0_0_10px_rgba(var(--accent-glow),0.8)]"
        >
          ✨ LEVEL UP! ✨
        </motion.h1>

        <div className="flex items-center justify-center gap-6 mb-8 w-full">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <LevelBadge level={oldLevel} size="lg" />
            <p className="text-center mt-2 text-sm text-text-muted font-display">{oldTitle}</p>
          </motion.div>
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
            <ArrowRight className="w-8 h-8 text-accent-primary animate-pulse" />
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
            <LevelBadge level={newLevel} size="lg" />
            <p className="text-center mt-2 text-sm text-accent-primary font-display font-bold">{newTitle}</p>
          </motion.div>
        </div>

        {benefits.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="w-full bg-background-elevated/50 p-4 rounded-xl border border-border-subtle mb-6 text-center"
          >
            <p className="text-text-secondary text-sm mb-2 font-medium">Novos Desbloqueios:</p>
            <ul className="text-sm space-y-1">
              {benefits.map((b, i) => (
                <li key={i} className="text-text-primary flex items-center justify-center gap-2">
                  <span className="text-accent-primary">✦</span> {b}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          onClick={onClose}
          className="bg-accent-primary hover:bg-accent-secondary text-white font-bold py-3 px-8 rounded-full transition-transform active:scale-95 shadow-lg w-full sm:w-auto"
        >
          Continuar Jornada
        </motion.button>
      </motion.div>
    </div>
  );
}
