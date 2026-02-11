import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationsService } from '@/services/api/notificationsService';
import { useMockDb, NotificationItem } from '@/store/useMockDb';
import { useAuthStore } from '@/store/useAuthStore';

// Type pour les notifications du backend
export interface BackendNotification {
    id: string;
    title: string;
    body: string;
    message?: string; // Fallback pour body
    created_at: string;
    createdAt?: string;
    is_read: boolean;
    read?: boolean;
    type?: string;
    data?: Record<string, any>;
}

// Type unifié pour les notifications
export interface Notification {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
    type?: string;
    data?: Record<string, any>;
}

// Normalise une notification backend vers le format unifié
const normalizeNotification = (n: BackendNotification | NotificationItem): Notification => {
    // Si c'est déjà au format NotificationItem (mock)
    if ('read' in n && typeof n.read === 'boolean' && !('is_read' in n)) {
        return n as Notification;
    }

    // Format backend
    const backend = n as BackendNotification;
    return {
        id: String(backend.id),
        title: backend.title,
        body: backend.body || backend.message || '',
        createdAt: backend.created_at || backend.createdAt || new Date().toISOString(),
        read: backend.is_read ?? backend.read ?? false,
        type: backend.type,
        data: backend.data,
    };
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Données mock
    const mockNotifications = useMockDb((s) => s.notifications);
    const mockMarkRead = useMockDb((s) => s.markNotificationRead);

    // Auth
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = !!token;

    // Nombre de notifications non lues
    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    // Récupère les notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (isAuthenticated) {
                // Utiliser le backend
                const response = await notificationsService.list();
                const data = Array.isArray(response) ? response : response?.results || [];
                setNotifications(data.map(normalizeNotification));
            } else {
                // Fallback mock
                setNotifications(mockNotifications.map(normalizeNotification));
            }
        } catch (err: any) {
            console.warn('[useNotifications] Erreur API, fallback mock:', err.message);
            // Fallback sur mock en cas d'erreur
            setNotifications(mockNotifications.map(normalizeNotification));
            setError(err.message || 'Erreur de chargement des notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, mockNotifications]);

    // Marquer une notification comme lue
    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        try {
            if (isAuthenticated) {
                await notificationsService.markRead(id);
            } else {
                mockMarkRead(id);
            }
        } catch (err) {
            console.warn('[useNotifications] Erreur markRead:', err);
            // Revert sur erreur
            fetchNotifications();
        }
    }, [isAuthenticated, mockMarkRead, fetchNotifications]);

    // Marquer toutes comme lues
    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {
            if (isAuthenticated) {
                await notificationsService.readAll();
            } else {
                // Mark all in mock
                notifications.forEach((n) => {
                    if (!n.read) mockMarkRead(n.id);
                });
            }
        } catch (err) {
            console.warn('[useNotifications] Erreur readAll:', err);
            fetchNotifications();
        }
    }, [isAuthenticated, mockMarkRead, notifications, fetchNotifications]);

    // Charger les notifications au montage et quand l'auth change
    useEffect(() => {
        fetchNotifications();
    }, [isAuthenticated]);

    // Synchroniser avec les notifications mock si en mode mock
    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications(mockNotifications.map(normalizeNotification));
            setLoading(false);
        }
    }, [mockNotifications, isAuthenticated]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
};
