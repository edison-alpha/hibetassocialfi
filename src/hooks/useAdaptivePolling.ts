// Adaptive polling hook - adjusts polling interval based on activity
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAdaptivePollingOptions {
  activeInterval?: number;
  inactiveInterval?: number;
  onPoll: () => void | Promise<void>;
  enabled?: boolean;
}

export const useAdaptivePolling = ({
  activeInterval = 3000,
  inactiveInterval = 10000,
  onPoll,
  enabled = true
}: UseAdaptivePollingOptions) => {
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsActive(isVisible);
      console.log(`📡 [POLLING] Tab ${isVisible ? 'active' : 'inactive'}, adjusting interval`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Polling logic
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const interval = isActive ? activeInterval : inactiveInterval;
    
    const poll = async () => {
      // Prevent concurrent polling
      if (isPollingRef.current) return;
      
      isPollingRef.current = true;
      try {
        await onPoll();
      } catch (error) {
        console.error('[POLLING] Error:', error);
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial poll
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isActive, activeInterval, inactiveInterval, onPoll]);

  const forceRefresh = useCallback(async () => {
    if (isPollingRef.current) return;
    await onPoll();
  }, [onPoll]);

  return { isActive, forceRefresh };
};
