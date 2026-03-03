import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Wraps vite-plugin-pwa's `useRegisterSW` and returns simple flags + an
 * `updateSW` trigger.  Auto-checks for updates every 60 seconds while the
 * app is open.
 */
export function usePWAUpdate() {
    const { needRefresh, updateServiceWorker } = useRegisterSW({
        onRegistered(r) {
            if (!r) return;
            // Poll for updates every 60 s
            setInterval(() => r.update(), 60_000);
        },
        onRegisterError(err) {
            console.warn('[PWA] SW registration failed:', err);
        },
    });

    return {
        needRefresh: needRefresh[0],
        updateSW: () => updateServiceWorker(true),
    };
}
