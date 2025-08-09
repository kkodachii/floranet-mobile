import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
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

  // Optional: example of listening to app foreground to simulate incoming mock
  const appState = useRef(AppState.currentState);
  React.useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        // Add a subtle general reminder when user returns
        addMock("general");
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [addMock]);

  // Auto-generate a random mock notification periodically
  React.useEffect(() => {
    const types = ["general", "emergency", "waste"];
    const id = setInterval(() => {
      const type = types[Math.floor(Math.random() * types.length)];
      addMock(type);
    }, 60000); // every 60s
    return () => clearInterval(id);
  }, [addMock]);

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
} 