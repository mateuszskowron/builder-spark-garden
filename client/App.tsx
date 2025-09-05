import "./global.css";
import "./i18n";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CasesPage from "./pages/plugins/CasesPage";
import InvoicesPage from "./pages/plugins/InvoicesPage";
import CalendarPage from "./pages/plugins/CalendarPage";
import MessagesPage from "./pages/plugins/MessagesPage";
import PaymentsPage from "./pages/plugins/PaymentsPage";
import AccountPage from "./pages/plugins/AccountPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/state/AuthContext";

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import { useTranslation } from "react-i18next";

function I18nPlaceholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return <PlaceholderPage title={t(titleKey)} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Protected>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/cases"
        element={
          <Protected>
            <AppLayout>
              <CasesPage />
            </AppLayout>
          </Protected>
        }
      />

      {[
        { path: "/invoices", titleKey: "nav.invoices" },
        { path: "/calendar", titleKey: "nav.calendar" },
        { path: "/messages", titleKey: "nav.messages" },
        { path: "/documents", titleKey: "nav.documents" },
        { path: "/payments", titleKey: "nav.payments" },
        { path: "/complaints", titleKey: "nav.complaints" },
        { path: "/reports", titleKey: "nav.reports" },
        { path: "/settings", titleKey: "nav.settings" },
        { path: "/account", titleKey: "nav.account" },
      ].map(({ path, titleKey }) => (
        <Route
          key={path}
          path={path}
          element={
            <Protected>
              <AppLayout>
                <I18nPlaceholder titleKey={titleKey} />
              </AppLayout>
            </Protected>
          }
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<Root />);
