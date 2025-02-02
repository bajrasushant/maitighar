import {
  useMemo, createContext, useContext, useState,
} from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ message: "", status: "" });

  const value = useMemo(() => ({ notification, setNotification }), [notification]);

  return (
    <NotificationContext.Provider
      value={value}
      id="notification"
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
