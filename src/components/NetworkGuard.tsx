'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetPage from '@/components/NoInternetPage';

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isOnline, quality, speedMbps, checking, checkNow } = useNetworkStatus();

  // Show overlay when: no internet, or connection is too slow
  const showOverlay = !isOnline || quality === 'offline' || quality === 'slow';

  return (
    <>
      {showOverlay && (
        <NoInternetPage
          quality={quality}
          speedMbps={speedMbps}
          onRetry={checkNow}
          checking={checking}
        />
      )}
      {/* Always render children so the page is ready when connection returns */}
      <div style={{ visibility: showOverlay ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  );
}
