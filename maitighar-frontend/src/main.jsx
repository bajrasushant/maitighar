import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { UserContextProvider } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </UserContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
