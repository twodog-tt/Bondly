import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import { NotificationProvider } from "./components/NotificationProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>,
);
