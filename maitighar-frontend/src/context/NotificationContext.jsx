import {
  useMemo, createContext, useContext, useState,
} from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ message: "", status: "" });

  const value = useMemo(() => ({ notification, setNotification }), [notification]);
  console.log(value);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
