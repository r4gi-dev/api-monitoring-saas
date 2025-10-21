'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/monitoring';

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error) {
        reportError(event.error, { type: 'uncaughtException' });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error) {
        reportError(event.reason, { type: 'unhandledRejection' });
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup function to remove the event listeners when the component unmounts
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // This component does not render anything
  return null;
}
