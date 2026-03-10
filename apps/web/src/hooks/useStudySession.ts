import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sq-token') : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export function useStudySession() {
  const queryClient = useQueryClient();

  const getActiveSession = useQuery({
    queryKey: ['activeSession'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/study/sessions/active`, { headers: getHeaders() });
      if (!res.ok) {
         if (res.status === 404) return null;
         throw new Error('Failed to fetch active session');
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    staleTime: 1000 * 30, // 30s
  });

  const createSession = useMutation({
    mutationFn: async (dto: { subject: string; topic?: string; mode: 'POMODORO'|'FREE'; cycleMinutes?: number; breakMinutes?: number; notes?: string }) => {
      const res = await fetch(`${API_URL}/study/sessions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error('Failed to create session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      queryClient.invalidateQueries({ queryKey: ['sessionHistory'] });
    }
  });

  const endSession = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await fetch(`${API_URL}/study/sessions/${id}/end`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to end session');
      return res.json(); // Returns { session, summary: { xpGained, leveledUp, etc } }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      queryClient.invalidateQueries({ queryKey: ['sessionHistory'] });
      // Here usually we'd also invalidate user globals to update XP bar in Layout
    }
  });

  const pauseSession = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/study/sessions/${id}/pause`, { method: 'PATCH', headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to pause');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activeSession'] })
  });

  const resumeSession = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/study/sessions/${id}/resume`, { method: 'PATCH', headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to resume');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activeSession'] })
  });

  const completePomodoro = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/study/sessions/${id}/pomodoro-complete`, { method: 'PATCH', headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to mark pomodoro complete');
      return res.json();
    }
  });

  return {
    getActiveSession,
    createSession,
    endSession,
    pauseSession,
    resumeSession,
    completePomodoro
  };
}
