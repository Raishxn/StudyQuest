import { useEffect, useRef } from 'react';

// Assumes baseURL logic exists, but since we are in `web` making requests to `api` directly:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UseHeartbeatProps {
  sessionId: string | null;
  isActive: boolean;
}

export function useHeartbeat({ sessionId, isActive }: UseHeartbeatProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && sessionId) {
      // Send immediately and then every 60s
      const sendHeartbeat = async () => {
        try {
          const token = localStorage.getItem('sq-token'); 
          await fetch(`${API_URL}/study/sessions/${sessionId}/heartbeat`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Failed to send session heartbeat', err);
        }
      };

      intervalRef.current = setInterval(sendHeartbeat, 60000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, isActive]);
}
