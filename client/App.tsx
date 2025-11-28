import { Toaster } from "@/components/ui/toaster";
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
import ListingDetailPage from "./pages/plugins/ListingDetailPage";
import OffersPage from "./pages/plugins/OffersPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/state/AuthContext";

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
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

      <Route
        path="/listings/:id"
        element={
          <Protected>
            <AppLayout>
              <ListingDetailPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route
        path="/offers"
        element={
          <Protected>
            <AppLayout>
              <OffersPage />
            </AppLayout>
          </Protected>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function Root() {
  return (
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
}
