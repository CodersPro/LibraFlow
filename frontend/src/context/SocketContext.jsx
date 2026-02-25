import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../api/axios';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, refreshUser } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const toast = useToast();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [user]);

    const markAllRead = useCallback(async () => {
        try {
            await api.put('/notifications/mark-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark notifications as read', err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const newSocket = io(`http://${window.location.hostname}:5000`);
            setSocket(newSocket);

            newSocket.emit('join', user._id);

            newSocket.on('notification', (notif) => {
                // Add to list immediately
                setNotifications(prev => [notif, ...prev]);

                // Auto-refresh user profile for points/badges
                if (notif.type === 'badge' || notif.title?.includes('Points')) {
                    refreshUser();
                }

                // Show toast feedback
                if (notif.type === 'badge') {
                    toast.success(notif.message, { icon: '🏆' });
                } else if (notif.type === 'success') {
                    toast.success(notif.message);
                } else {
                    toast.info(notif.message);
                }
            });

            return () => newSocket.close();
        } else {
            setSocket(null);
            setNotifications([]);
        }
    }, [user, fetchNotifications, toast, refreshUser]);

    const value = {
        socket,
        notifications,
        markAllRead,
        unreadCount: notifications.filter(n => !n.isRead).length
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
