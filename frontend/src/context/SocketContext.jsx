/**
 * Nam Nadu — Socket Context
 * WebSocket connection management via Socket.IO
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { WS_BASE_URL, TOKEN_KEY } from '@/constants';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { addNotification, showToast } = useNotifications();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In production, or if no valid websocket URL is provided, disable sockets completely
    if (import.meta.env.PROD || !WS_BASE_URL || WS_BASE_URL.includes('127.0.0.1') || WS_BASE_URL.includes('localhost')) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Only connect when authenticated
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    // Create Socket.IO connection
    const socket = io(WS_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    // Listen for real-time notifications
    socket.on('notification', (data) => {
      addNotification(data);
      showToast(data.message, data.type || 'info');
    });

    // Listen for complaint status updates
    socket.on('complaint_update', (data) => {
      addNotification({
        id: Date.now(),
        title: 'Complaint Update',
        message: data.message,
        type: 'complaint_update',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    // Listen for emergency alerts
    socket.on('emergency_alert', (data) => {
      showToast(data.message, 'error', 10000);
      addNotification({
        id: Date.now(),
        title: '⚠ Emergency Alert',
        message: data.message,
        type: 'emergency',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    // Listen for dashboard data updates
    socket.on('dashboard_update', (data) => {
      // Emit custom event for dashboard components to listen to
      window.dispatchEvent(new CustomEvent('dashboard_update', { detail: data }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user, addNotification, showToast]);

  /**
   * Emit an event through the socket
   */
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  /**
   * Subscribe to a socket event
   */
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
