import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import GoogleAuthBoundary from "./components/GoogleAuthBoundary.jsx";
import SmoothScrollProvider from "./components/SmoothScrollProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleAuthBoundary>
        <SidebarProvider>
          <BrowserRouter>
            <SmoothScrollProvider>
              <AuthProvider>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3600,
                    className:
                      "!rounded-2xl !border !border-slate-200 !bg-white/95 !text-slate-900 !shadow-2xl !backdrop-blur dark:!border-slate-800 dark:!bg-slate-950/95 dark:!text-slate-100",
                    success: { duration: 3000 },
                  }}
                />
                <App />
              </AuthProvider>
            </SmoothScrollProvider>
          </BrowserRouter>
        </SidebarProvider>
      </GoogleAuthBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
