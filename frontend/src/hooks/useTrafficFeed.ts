import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type TrafficFeedMessage, type TrafficStats } from '../services/api';

type TrafficFeedMode = 'live' | 'snapshot';

interface UseTrafficFeedOptions {
  mode?: TrafficFeedMode;
  enabled?: boolean;
  pollIntervalMs?: number;
}

const emptyStats: TrafficStats = {
  total_count: 0,
  direction_counts: {},
  class_counts: {},
  fps: 0,
  processed_frames: 0,
  source: 'webcam',
  running: false,
  active_connections: 0,
};

export function useTrafficFeed(options: UseTrafficFeedOptions = {}) {
  const { mode = 'snapshot', enabled = true, pollIntervalMs = 2000 } = options;
  const [stats, setStats] = useState<TrafficStats>(emptyStats);
  const [frame, setFrame] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const applyMessage = (message: TrafficFeedMessage) => {
    setStats(message.stats);
    if (message.frame !== undefined) {
      setFrame(message.frame);
    }
    setLastUpdateAt(Date.now());
    setError(null);
  };

  const loadSnapshot = useCallback(async () => {
    try {
      const snapshot = await api.getStats();
      if (!mountedRef.current) {
        return;
      }
      setStats(snapshot);
      setLastUpdateAt(Date.now());
      setError(null);
    } catch (fetchError) {
      if (mountedRef.current) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load traffic stats');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearTimers = () => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const closeSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadSnapshot();

    return () => {
      mountedRef.current = false;
      clearTimers();
      closeSocket();
    };
  }, []);

  useEffect(() => {
    clearTimers();
    closeSocket();
    setFrame(null);

    if (!enabled) {
      setIsConnected(false);
      return;
    }

    if (mode === 'snapshot') {
      pollTimerRef.current = window.setInterval(() => {
        void loadSnapshot();
      }, pollIntervalMs);
      return;
    }

    const connect = () => {
      const socket = api.connectWebSocket((message) => {
        if (!mountedRef.current) {
          return;
        }
        applyMessage(message);
        setIsConnected(true);
        setIsLoading(false);
      });

      wsRef.current = socket;
      socket.onopen = () => {
        if (!mountedRef.current) {
          return;
        }
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
      };
      socket.onerror = () => {
        if (!mountedRef.current) {
          return;
        }
        setIsConnected(false);
      };
      socket.onclose = () => {
        if (!mountedRef.current) {
          return;
        }
        setIsConnected(false);
        if (enabled && mode === 'live') {
          reconnectTimerRef.current = window.setTimeout(connect, 1200);
        }
      };
    };

    connect();
  }, [enabled, loadSnapshot, mode, pollIntervalMs]);

  return {
    stats,
    frame,
    isConnected,
    isLoading,
    error,
    lastUpdateAt,
    refresh: loadSnapshot,
  };
}

export type { TrafficFeedMode, UseTrafficFeedOptions };
