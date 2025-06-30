import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  id: string;
  type: "success" | "info" | "error" | "warning";
  message: string;
}

interface NotificationContextType {
  notify: (message: string, type?: Notification["type"]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string, type: Notification["type"] = "info") => {
    const id = Date.now().toString() + Math.random();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: "240px",
          pointerEvents: "none",
        }}
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              background:
                n.type === "success"
                  ? "#48bb78"
                  : n.type === "error"
                    ? "#f56565"
                    : n.type === "warning"
                      ? "#ed8936"
                      : "#667eea",
              color: "white",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              padding: "16px 24px",
              fontSize: 15,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pointerEvents: "auto",
              cursor: "pointer",
              minWidth: "220px",
              maxWidth: "360px",
              transition: "all 0.2s",
              opacity: 0.95,
            }}
            onClick={() => remove(n.id)}
          >
            <span>{n.message}</span>
            <span style={{ marginLeft: 16, fontWeight: 700, fontSize: 18 }}>
              &times;
            </span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
