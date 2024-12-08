import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { UserContextProvider } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";
import helpers from "./helpers/helpers";

const queryClient = new QueryClient();
helpers.initializeToken();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </UserContextProvider>
  </QueryClientProvider>,
);
