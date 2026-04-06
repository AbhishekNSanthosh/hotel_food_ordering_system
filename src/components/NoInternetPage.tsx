'use client';

import { useEffect, useState } from 'react';
import { NetworkQuality } from '@/hooks/useNetworkStatus';

interface NoInternetPageProps {
  quality: NetworkQuality;
  speedMbps: number | null;
  onRetry: () => void;
  checking: boolean;
}

export default function NoInternetPage({
  quality,
  speedMbps,
  onRetry,
  checking,
}: NoInternetPageProps) {
  const [dots, setDots] = useState('');
  const [waveActive, setWaveActive] = useState(false);

  // Animated dots for "Checking..." text
  useEffect(() => {
    const iv = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(iv);
  }, []);

  const isOffline = quality === 'offline';

  const handleRetry = () => {
    setWaveActive(true);
    setTimeout(() => setWaveActive(false), 1000);
    onRetry();
  };

  return (
    <div style={styles.overlay}>
      {/* Animated background blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />

      <div style={styles.card}>
        {/* Icon area */}
        <div style={styles.iconWrap}>
          <div style={{ ...styles.iconRing, ...(waveActive ? styles.iconRingPulse : {}) }}>
            {isOffline ? (
              // WiFi off icon
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f87171' }}>
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" fill="currentColor" />
              </svg>
            ) : (
              // Slow wifi icon
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fb923c' }}>
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" fill="currentColor" />
                <line x1="12" y1="14" x2="12" y2="14.01" stroke="#fb923c" strokeWidth="3" />
              </svg>
            )}
          </div>
          {/* Signal bars */}
          <div style={styles.signalBars}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  ...styles.bar,
                  height: `${(i + 1) * 8}px`,
                  backgroundColor: isOffline
                    ? '#3f3f46'
                    : i < (speedMbps && speedMbps > 2 ? 4 : speedMbps && speedMbps > 1 ? 3 : 1)
                    ? '#fb923c'
                    : '#3f3f46',
                  opacity: isOffline ? 0.3 : 1,
                  transition: 'background-color 0.5s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Text content */}
        <h1 style={styles.title}>
          {isOffline ? 'No Internet Connection' : 'Very Slow Connection'}
        </h1>
        <p style={styles.subtitle}>
          {isOffline
            ? "It looks like you're offline. Please check your Wi-Fi or mobile data and try again."
            : `Your connection speed is too slow for a smooth experience (${
                speedMbps !== null ? speedMbps.toFixed(2) + ' Mbps' : 'very low'
              }). Please switch to a better network.`}
        </p>

        {/* Tips */}
        <div style={styles.tips}>
          {(isOffline
            ? ['Check your Wi-Fi or mobile data', 'Move closer to your router', 'Restart your router or modem']
            : ['Move closer to your Wi-Fi router', 'Disconnect other devices', 'Switch from mobile data to Wi-Fi']
          ).map((tip, i) => (
            <div key={i} style={styles.tipRow}>
              <span style={styles.tipDot}>•</span>
              <span style={styles.tipText}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          disabled={checking}
          style={{
            ...styles.retryBtn,
            ...(checking ? styles.retryBtnDisabled : {}),
          }}
        >
          {checking ? (
            <>
              <span style={styles.spinner} />
              Checking{dots}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
              </svg>
              Try Again
            </>
          )}
        </button>

        <p style={styles.footer}>
          Hotel Delish — Fine Dining
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #0f172a 100%)',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  // Background animated blobs
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.15,
    animation: 'blobFloat 8s ease-in-out infinite alternate',
    pointerEvents: 'none',
  },
  blob1: {
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, #6366f1, transparent)',
    top: '-100px',
    left: '-100px',
    animationDelay: '0s',
  },
  blob2: {
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, #f43f5e, transparent)',
    bottom: '-80px',
    right: '-80px',
    animationDelay: '3s',
  },
  blob3: {
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, #0ea5e9, transparent)',
    top: '40%',
    left: '60%',
    animationDelay: '1.5s',
  },
  // Card
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(24, 24, 27, 0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  // Icon
  iconWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px',
  },
  iconRing: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 0.4s ease',
  },
  iconRingPulse: {
    boxShadow: '0 0 0 12px rgba(99,102,241,0.15), 0 0 0 24px rgba(99,102,241,0.06)',
  },
  signalBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '5px',
    height: '36px',
  },
  bar: {
    width: '10px',
    borderRadius: '3px',
    transition: 'background-color 0.4s ease',
  },
  // Text
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fafafa',
    margin: '0 0 12px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#a1a1aa',
    lineHeight: 1.7,
    margin: '0 0 24px',
  },
  // Tips
  tips: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '28px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tipDot: {
    color: '#6366f1',
    fontSize: '18px',
    lineHeight: 1,
    flexShrink: 0,
  },
  tipText: {
    fontSize: '13px',
    color: '#a1a1aa',
  },
  // Button
  retryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px 24px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.15s',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
    marginBottom: '20px',
  },
  retryBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    fontSize: '12px',
    color: '#52525b',
    margin: 0,
  },
};
