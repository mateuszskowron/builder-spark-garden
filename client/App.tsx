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
import InvoicesPage from "./pages/plugins/InvoicesPage";
import PaymentsPage from "./pages/plugins/PaymentsPage";
import AccountPage from "./pages/plugins/AccountPage";
import CompaniesPage from "./pages/plugins/CompaniesPage";
import UserManagementPage from "./pages/plugins/UserManagementPage";
import RegistrationRequestsPage from "./pages/plugins/RegistrationRequestsPage";
import SalesListingsPage from "./pages/plugins/SalesListingsPage";
import PurchaseListingsPage from "./pages/plugins/PurchaseListingsPage";
import MyListingsPage from "./pages/plugins/MyListingsPage";
import ChatPage from "./pages/plugins/ChatPage";
import ContactPage from "./pages/plugins/ContactPage";
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
        path="/invoices"
        element={
          <Protected>
            <AppLayout>
              <InvoicesPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/calendar"
        element={
          <Protected>
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/messages"
        element={
          <Protected>
            <AppLayout>
              <MessagesPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/payments"
        element={
          <Protected>
            <AppLayout>
              <PaymentsPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/account"
        element={
          <Protected>
            <AppLayout>
              <AccountPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/companies"
        element={
          <Protected>
            <AppLayout>
              <CompaniesPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/users"
        element={
          <Protected>
            <AppLayout>
              <UserManagementPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/registration-requests"
        element={
          <Protected>
            <AppLayout>
              <RegistrationRequestsPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/sales"
        element={
          <Protected>
            <AppLayout>
              <SalesListingsPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/purchases"
        element={
          <Protected>
            <AppLayout>
              <PurchaseListingsPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/my-listings"
        element={
          <Protected>
            <AppLayout>
              <MyListingsPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/chat"
        element={
          <Protected>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/contact"
        element={
          <Protected>
            <AppLayout>
              <ContactPage />
            </AppLayout>
          </Protected>
        }
      />

      {[
        { path: "/documents", titleKey: "nav.documents" },
        { path: "/complaints", titleKey: "nav.complaints" },
        { path: "/reports", titleKey: "nav.reports" },
        { path: "/settings", titleKey: "nav.settings" },
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
