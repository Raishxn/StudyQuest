'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, XCircle } from 'lucide-react';

interface SessionEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  expectedXP: number;
  durationMinutes: number;
  pomodorosCount: number;
}

export function SessionEndModal({ isOpen, onClose, onConfirm, expectedXP, durationMinutes, pomodorosCount }: SessionEndModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-background-base/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-background-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden p-6 text-center"
          >
            <h2 className="text-xl font-bold text-text-primary font-display uppercase tracking-wide mb-6">
              Encerrar Sessão
            </h2>

            <div className="flex justify-center gap-6 mb-8 text-text-primary">
               {/* Duration */}
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-background-elevated rounded-full flex items-center justify-center mb-2 shadow-inner">
                    <Clock className="w-6 h-6 text-info" />
                  </div>
                  <span className="font-mono font-bold text-lg">{durationMinutes}m</span>
                  <span className="text-xs text-text-muted">Duração</span>
               </div>

               {/* Pomodoros */}
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-background-elevated rounded-full flex items-center justify-center mb-2 shadow-inner">
                    <span className="text-2xl drop-shadow-sm">🍅</span>
                  </div>
                  <span className="font-mono font-bold text-lg">{pomodorosCount}</span>
                  <span className="text-xs text-text-muted">Pomodoros</span>
               </div>

               {/* Estimated XP */}
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-background-elevated rounded-full flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(var(--accent-glow),0.3)]">
                    <Trophy className="w-6 h-6 text-accent-primary" />
                  </div>
                  <span className="font-mono font-bold text-lg text-accent-primary">+{expectedXP}</span>
                  <span className="text-xs text-text-muted">XP Esperado</span>
               </div>
            </div>

            <div className="mb-6 text-left">
               <label className="block text-sm font-medium text-text-secondary mb-1">Anotações finais (Opcional)</label>
               <textarea 
                 rows={2} placeholder="O que você aprendeu?"
                 value={notes} onChange={e => setNotes(e.target.value)}
                 className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary transition-colors resize-none text-sm"
               />
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirm} 
                disabled={isSubmitting}
                className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white rounded-xl text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Encerrando...' : 'Encerrar e Ganhar XP'}
              </button>
              <button 
                onClick={onClose} 
                disabled={isSubmitting}
                className="w-full py-3 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              >
                Continuar estudando
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
