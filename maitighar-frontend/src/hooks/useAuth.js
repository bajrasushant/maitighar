import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const useAuthStatus = () => {
  const { user, login, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      login(JSON.parse(storedUser));
    } else {
      logout();
    }
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
};
