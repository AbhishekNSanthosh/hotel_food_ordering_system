'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type NetworkQuality = 'good' | 'slow' | 'offline';

export interface NetworkStatus {
  isOnline: boolean;
  quality: NetworkQuality;
  speedMbps: number | null;
  checking: boolean;
  checkNow: () => Promise<void>;
}

// Small probe URL – reuse Next.js's own favicon (always available locally)
const PROBE_URL = '/favicon.ico';
// Thresholds in Mbps
const SLOW_THRESHOLD = 0.5; // below 0.5 Mbps = "slow"

async function measureSpeed(): Promise<number | null> {
  try {
    const startTime = performance.now();
    // Cache-bust so browser always fetches fresh
    const response = await fetch(`${PROBE_URL}?cb=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    const endTime = performance.now();
    const durationSeconds = (endTime - startTime) / 1000;
    const sizeBytes = blob.size;
    const speedMbps = (sizeBytes * 8) / (durationSeconds * 1_000_000);
    return speedMbps;
  } catch {
    return null;
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [quality, setQuality] = useState<NetworkQuality>('good');
  const [speedMbps, setSpeedMbps] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkNetwork = useCallback(async () => {
    // If browser already knows we're offline
    if (!navigator.onLine) {
      setIsOnline(false);
      setQuality('offline');
      setSpeedMbps(null);
      return;
    }

    setChecking(true);
    const speed = await measureSpeed();
    setChecking(false);

    if (speed === null) {
      // Fetch failed despite navigator.onLine — treat as offline
      setIsOnline(false);
      setQuality('offline');
      setSpeedMbps(null);
    } else {
      setIsOnline(true);
      setSpeedMbps(speed);
      setQuality(speed < SLOW_THRESHOLD ? 'slow' : 'good');
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkNetwork();

    const handleOnline = () => checkNetwork();
    const handleOffline = () => {
      setIsOnline(false);
      setQuality('offline');
      setSpeedMbps(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic re-check every 30 seconds
    intervalRef.current = setInterval(checkNetwork, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkNetwork]);

  return { isOnline, quality, speedMbps, checking, checkNow: checkNetwork };
}
