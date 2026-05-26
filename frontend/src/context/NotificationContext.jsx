/**
 * Nam Nadu — Notification Context
 * Real-time notification state & toast management
 */
import { createContext, useContext, useReducer, useCallback } from 'react';

// Toast notification state (ephemeral UI messages)
// Persistent notifications (from API/WebSocket)
const initialState = {
  notifications: [], // Persistent notifications from server
  toasts: [],        // Ephemeral toast messages
  unreadCount: 0,
};

const NOTIF_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  MARK_READ: 'MARK_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

let toastId = 0;

function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIF_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.is_read).length,
      };
    case NOTIF_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case NOTIF_ACTIONS.MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case NOTIF_ACTIONS.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      };
    case NOTIF_ACTIONS.REMOVE_NOTIFICATION:
      const removed = state.notifications.find((n) => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        unreadCount: removed && !removed.is_read ? state.unreadCount - 1 : state.unreadCount,
      };
    case NOTIF_ACTIONS.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case NOTIF_ACTIONS.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Set all notifications (from API fetch)
  const setNotifications = useCallback((notifications) => {
    dispatch({ type: NOTIF_ACTIONS.SET_NOTIFICATIONS, payload: notifications });
  }, []);

  // Add a single notification (from WebSocket)
  const addNotification = useCallback((notification) => {
    dispatch({ type: NOTIF_ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  // Mark single notification as read
  const markRead = useCallback((id) => {
    dispatch({ type: NOTIF_ACTIONS.MARK_READ, payload: id });
  }, []);

  // Mark all as read
  const markAllRead = useCallback(() => {
    dispatch({ type: NOTIF_ACTIONS.MARK_ALL_READ });
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: NOTIF_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {'success'|'error'|'warning'|'info'} type - Toast type
   * @param {number} duration - Auto-dismiss duration in ms (default 4000)
   */
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    dispatch({
      type: NOTIF_ACTIONS.ADD_TOAST,
      payload: { id, message, type, duration },
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: NOTIF_ACTIONS.REMOVE_TOAST, payload: id });
      }, duration);
    }

    return id;
  }, []);

  // Dismiss toast
  const dismissToast = useCallback((id) => {
    dispatch({ type: NOTIF_ACTIONS.REMOVE_TOAST, payload: id });
  }, []);

  const value = {
    ...state,
    setNotifications,
    addNotification,
    markRead,
    markAllRead,
    removeNotification,
    showToast,
    dismissToast,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
