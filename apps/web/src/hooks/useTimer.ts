import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'POMODORO' | 'FREE';
export type TimerPhase = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

interface UseTimerProps {
  mode: TimerMode;
  cycleMinutes?: number;
  breakMinutes?: number;
  onCycleComplete?: () => void;
}

export function useTimer({
  mode,
  cycleMinutes = 25,
  breakMinutes = 5,
  onCycleComplete
}: UseTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(mode === 'POMODORO' ? cycleMinutes * 60 : 0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        if (mode === 'FREE') {
          setTimeLeft((prev) => prev + 1);
          setTotalActiveSeconds((prev) => prev + 1);
        } else {
          // POMODORO Mode
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Time's up for current phase
              if (phase === 'FOCUS') {
                const newCycle = cycleCount + 1;
                setCycleCount(newCycle);
                setPhase(newCycle % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK');
                if (onCycleComplete) onCycleComplete();
                return (newCycle % 4 === 0 ? breakMinutes * 3 : breakMinutes) * 60;
              } else {
                // Break ended, back to focus
                setPhase('FOCUS');
                return cycleMinutes * 60;
              }
            }
            if (phase === 'FOCUS') {
               setTotalActiveSeconds((curr) => curr + 1);
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, mode, phase, cycleCount, cycleMinutes, breakMinutes, onCycleComplete]);

  // Format MM:SS
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const timeFormatted = `${m}:${s}`;

  // Progress logic (0 to 100)
  let progressPercent = 0;
  if (mode === 'POMODORO') {
    const totalPhaseSeconds = phase === 'FOCUS' 
      ? cycleMinutes * 60 
      : (cycleCount > 0 && cycleCount % 4 === 0 ? breakMinutes * 3 : breakMinutes) * 60;
    
    // Reverse logic: 100% is when timer reaches 0
    progressPercent = Math.max(0, Math.min(100, ((totalPhaseSeconds - timeLeft) / totalPhaseSeconds) * 100));
  } else {
     // FREE mode: arbitrary subtle pulsing or just 100% wrapper
     progressPercent = isRunning ? 100 : 0;
  }

  return {
    start,
    pause,
    resume,
    stop,
    timeLeft,
    timeFormatted,
    progressPercent,
    isRunning,
    isPaused,
    phase,
    cycleCount,
    totalActiveSeconds
  };
}
