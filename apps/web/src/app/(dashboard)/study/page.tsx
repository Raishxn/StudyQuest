'use client';

import { useState } from 'react';
import { useStudySession } from '../../../hooks/useStudySession';
import { TimerPanel } from '../../../components/study/TimerPanel';
import { NewSessionModal } from '../../../components/study/NewSessionModal';
import { SessionEndModal } from '../../../components/study/SessionEndModal';
import { LevelUpModal } from '../../../components/rpg/LevelUpModal';
import { triggerXPToast } from '../../../components/rpg/XPToast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Play } from 'lucide-react';

const mockChartData = [
  { name: 'Seg', hours: 2.5 },
  { name: 'Ter', hours: 3.8 },
  { name: 'Qua', hours: 1.2 },
  { name: 'Qui', hours: 4.5 },
  { name: 'Sex', hours: 3.0 },
  { name: 'Sáb', hours: 5.2 },
  { name: 'Dom', hours: 2.1 },
];

export default function StudyPage() {
  const { getActiveSession, createSession, endSession } = useStudySession();
  
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
  
  const [levelUpData, setLevelUpData] = useState<any>(null); // To trigger LevelUpModal

  const activeSession = getActiveSession.data;
  const isFetchingActive = getActiveSession.isLoading;

  const handleCreateSession = async (data: any) => {
    await createSession.mutateAsync(data);
  };

  const requestEndSession = () => {
    setIsEndSessionOpen(true);
  };

  const confirmEndSession = async (notes: string) => {
    if (!activeSession) return;
    
    const response = await endSession.mutateAsync({ id: activeSession.id, notes });
    setIsEndSessionOpen(false);
    
    if (response.summary?.xpGained > 0) {
      triggerXPToast(response.summary.xpGained);
    }

    if (response.summary?.leveledUp) {
      setLevelUpData({
        oldLevel: activeSession.user?.level || 1, // Fallbacks
        newLevel: response.summary.newLevel,
        oldTitle: activeSession.user?.title || 'Estudante',
        newTitle: 'Novo Título (Mocked)', // In a real app the API would return the new title
        benefits: ['Mais bônus diário', 'Novo ícone de perfil liberado'] 
      });
    }
  };

  return (
    <div className="flex h-full -m-4 lg:-m-6"> {/* Negative margin to bleed to layout edges */}
      
      {/* LEFT SCROLLABLE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 overflow-y-auto w-full relative z-0">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-cinzel)] text-accent-primary uppercase tracking-wide">Sala de Estudos</h1>
            <p className="text-text-secondary mt-1 max-w-lg text-sm sm:text-base">Inicie uma sessão de estudos focada para ganhar XP para o seu personagem.</p>
          </div>
          
          <button 
            onClick={() => setIsNewSessionOpen(true)}
            disabled={!!activeSession}
            className={`hidden sm:flex px-6 py-3 rounded-xl font-bold transition-all shadow-md items-center gap-2 ${
              !!activeSession 
                ? 'bg-background-elevated text-text-muted cursor-not-allowed opacity-50'
                : 'bg-accent-primary hover:bg-accent-secondary text-white active:scale-95'
            }`}
          >
            {/* @ts-ignore */}
            <Play size={18} fill="currentColor" /> Nova Sessão
          </button>

          {/* Mobile FAB */}
          <button 
             onClick={() => setIsNewSessionOpen(true)}
             disabled={!!activeSession}
             className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-accent-primary text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent-glow),0.5)] z-40 disabled:opacity-50 disabled:hidden"
          >
             {/* @ts-ignore */}
             <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           <div className="lg:col-span-2 bg-background-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Horas Estudadas (Últimos 7 dias)</h3>
             <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--text-muted))', fontSize: 12 }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--text-muted))', fontSize: 12 }} />
                   <Tooltip 
                     cursor={{ fill: 'hsl(var(--bg-elevated))' }} 
                     contentStyle={{ backgroundColor: 'hsl(var(--bg-surface))', borderColor: 'hsl(var(--border-subtle))', borderRadius: '8px', color: 'hsl(var(--text-primary))' }}
                   />
                   <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                     {mockChartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={'hsl(var(--accent-primary))'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-background-surface border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-background-elevated rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🏆</span>
             </div>
             <h4 className="font-bold text-text-primary text-lg mb-1">Mestre da Semana</h4>
             <p className="text-text-muted text-sm mb-4">Alcance 20 horas de estudo nesta semana para receber a Orelha de Goblin (+500 XP).</p>
             <div className="w-full h-2 bg-background-base rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[60%]" />
             </div>
             <p className="text-xs font-mono text-warning font-bold mt-2">12 / 20 Horas</p>
           </div>
        </div>

        {/* History List */}
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 mt-4">Sessões Recentes</h3>
        <div className="space-y-3">
          {/* Mocked History Items */}
          {[1,2,3].map(i => (
             <div key={i} className="bg-background-surface border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-primary/50 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-background-elevated rounded-full flex items-center justify-center text-xl shrink-0">
                    {i === 1 ? '💻' : i === 2 ? '📐' : '🧬'}
                 </div>
                 <div>
                   <h4 className="font-bold text-text-primary text-sm sm:text-base">{i === 1 ? 'Programação' : i === 2 ? 'Matemática' : 'Biologia'}</h4>
                   <p className="text-xs sm:text-sm text-text-muted font-mono">{i === 1 ? '25 Min • Pomodoro' : '40 Min • Avulso'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 sm:gap-4 bg-background-base px-3 py-1.5 rounded-lg border border-border-subtle shrink-0">
                 <span className="text-sm font-bold text-accent-primary drop-shadow-sm">+{i === 1 ? 50 : 80} XP ⚡</span>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* RIGHT FIXED TIMER PANEL (Desktop) or FULLSCREEN (Mobile) */}
      {activeSession && !isFetchingActive && (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] md:shadow-none">
           <TimerPanel session={activeSession} onEndRequest={requestEndSession} />
        </div>
      )}

      {/* MODALS */}
      <NewSessionModal isOpen={isNewSessionOpen} onClose={() => setIsNewSessionOpen(false)} onSubmit={handleCreateSession} />
      
      {activeSession && (
        <SessionEndModal 
          isOpen={isEndSessionOpen} 
          onClose={() => setIsEndSessionOpen(false)} 
          onConfirm={confirmEndSession}
          // Assuming calculations:
          expectedXP={Math.floor((activeSession.duration / 60) * 2) + Math.min(0, activeSession.pomodorosCompleted * 5)} 
          durationMinutes={Math.floor(activeSession.duration / 60)}
          pomodorosCount={activeSession.pomodorosCompleted}
        />
      )}

      {levelUpData && (
        <LevelUpModal {...levelUpData} onClose={() => setLevelUpData(null)} />
      )}
    </div>
  );
}
