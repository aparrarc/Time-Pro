import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';

/**
 * Hook that handles browser notification permission request
 * and sends notifications for absence request approvals.
 */
export function useNotifications() {
    const { absenceRequests, user, addToast } = useAppStore();

    // Request permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const sendNotification = useCallback((title: string, body: string, icon = '⏰') => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: `timetrack-${Date.now()}`,
            });
        }
        // Also as in-app toast
        addToast('info', `${icon} ${body}`);
    }, [addToast]);

    // Watch for absence status changes
    useEffect(() => {
        if (!user) return;

        const channel = 'Notification' in window
            ? absenceRequests.filter(r => r.status !== 'pending')
            : [];

        // We only notify on first render after status change
        const latestApproved = channel.find(r =>
            (r.status === 'approved' || r.status === 'rejected') &&
            new Date(r.reviewed_at || '').getTime() > Date.now() - 60000
        );

        if (latestApproved) {
            const statusText = latestApproved.status === 'approved' ? 'aprobada ✅' : 'rechazada ❌';
            sendNotification(
                'Solicitud de ausencia',
                `Tu solicitud ha sido ${statusText}`,
                latestApproved.status === 'approved' ? '✅' : '❌'
            );
        }
    }, [absenceRequests, user, sendNotification]);

    return { sendNotification };
}
