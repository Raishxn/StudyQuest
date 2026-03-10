'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mocked subject list
const SUBJECTS = ['Programação', 'Matemática', 'Banco de Dados', 'Inglês', 'História'];

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function NewSessionModal({ isOpen, onClose, onSubmit }: NewSessionModalProps) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'POMODORO' | 'FREE'>('POMODORO');
  const [cycleMinutes, setCycleMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ subject, topic, mode, cycleMinutes, breakMinutes, notes });
      onClose(); // Automatically closes on success
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-background-base/80 backdrop-blur-sm"
            onClick={!isLoading ? onClose : undefined}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-background-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border-subtle">
               <h2 className="text-xl font-bold text-text-primary text-center font-[family-name:var(--font-cinzel)] uppercase tracking-wide">
                 Nova Sessão
               </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Matéria *</label>
                 <select 
                   required
                   value={subject}
                   onChange={e => setSubject(e.target.value)}
                   className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                 >
                   {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Tópico (Opcional)</label>
                 <input 
                   type="text"
                   placeholder="Ex: Árvores Binárias"
                   value={topic}
                   onChange={e => setTopic(e.target.value)}
                   className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                 />
               </div>

               <div className="flex bg-background-base p-1 rounded-lg border border-border-subtle">
                 <button 
                   type="button"
                   onClick={() => setMode('POMODORO')}
                   className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'POMODORO' ? 'bg-background-elevated text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                 >
                   🍅 Pomodoro
                 </button>
                 <button 
                   type="button"
                   onClick={() => setMode('FREE')}
                   className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'FREE' ? 'bg-background-elevated text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                 >
                   ⏱️ Avulso
                 </button>
               </div>

               {mode === 'POMODORO' && (
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-sm font-medium text-text-secondary mb-1">Foco (min)</label>
                     <input 
                       type="number" min="5" max="90" required
                       value={cycleMinutes} onChange={e => setCycleMinutes(Number(e.target.value))}
                       className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                     />
                   </div>
                   <div className="flex-1">
                     <label className="block text-sm font-medium text-text-secondary mb-1">Pausa (min)</label>
                     <input 
                       type="number" min="1" max="30" required
                       value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))}
                       className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                     />
                   </div>
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Anotações iniciais</label>
                 <textarea 
                   rows={2} placeholder="Sua intenção com esse estudo..."
                   value={notes} onChange={e => setNotes(e.target.value)}
                   className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary transition-colors resize-none"
                 />
               </div>
            </form>

            <div className="p-4 border-t border-border-subtle bg-background-base/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                {isLoading ? 'Iniciando...' : '🚀 Iniciar Sessão'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
