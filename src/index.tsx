import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// 🔥 Theme Provider
import { ThemeProvider } from "./services/ThemeContext";

import { DialogProvider } from "./contexts/DialogContext";

// 🔥 Global Styles (Tailwind v4 + themes)
import "./index.css";


// 🔥 Mount React App
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </ThemeProvider>
  </React.StrictMode>
);
