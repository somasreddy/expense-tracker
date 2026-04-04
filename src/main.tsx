import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./services/ThemeContext";
import { DialogProvider } from "./contexts/DialogContext";
import { ToastProvider } from './contexts/ToastContext';
import Footer from "./components/Footer";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <DialogProvider>
        <ToastProvider>
          <App />
          <Footer />
        </ToastProvider>
      </DialogProvider>
    </ThemeProvider>
  </React.StrictMode>
);
