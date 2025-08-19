import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import mockNotifications, { generateMockNotification } from "./mockNotifications";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [{ ...notification }, ...prev]);
  }, []);

  const addMock = useCallback((type = "general") => {
    addNotification(generateMockNotification(type));
  }, [addNotification]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, addNotification, addMock, markAsRead, markAllAsRead, clearAll, removeNotification }),
    [notifications, unreadCount, addNotification, addMock, markAsRead, markAllAsRead, clearAll, removeNotification]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
} 