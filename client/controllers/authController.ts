import type { User, RegistrationRequest } from "@/models/types";
import { createRegistrationRequest } from "./userManagementController";
import {
  authenticateUser,
  getCurrentAdminUser,
  logoutUser,
  clearAuthToken,
  getAuthToken,
} from "@/services/mercurjsApi";

// Demo account credentials
const DEMO_ACCOUNTS: { email: string; password: string; user: User }[] = [
  {
    email: "demo@example.com",
    password: "demo123",
    user: {
      id: "demo-user-001",
      name: "Demo User",
      email: "demo@example.com",
      role: "admin",
      userRole: "admin",
      companyId: "demo-company-001",
      companyName: "Demo Company Sp. z o.o.",
    },
  },
  {
    email: "admin@example.com",
    password: "admin123",
    user: {
      id: "demo-admin-001",
      name: "Administrator",
      email: "admin@example.com",
      role: "admin",
      userRole: "admin",
      companyId: "demo-company-001",
      companyName: "Demo Company Sp. z o.o.",
    },
  },
  {
    email: "seller@example.com",
    password: "seller123",
    user: {
      id: "demo-seller-001",
      name: "Jan Sprzedawca",
      email: "seller@example.com",
      role: "company_user",
      userRole: "seller",
      companyId: "demo-company-002",
      companyName: "Sprzedawca Sp. z o.o.",
    },
  },
  {
    email: "buyer@example.com",
    password: "buyer123",
    user: {
      id: "demo-buyer-001",
      name: "Anna Kupująca",
      email: "buyer@example.com",
      role: "company_user",
      userRole: "buyer",
      companyId: "demo-company-003",
      companyName: "Kupujący S.A.",
    },
  },
];

function isDemoAccount(email: string, password: string): User | null {
  const demoAccount = DEMO_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === email.toLowerCase() &&
      acc.password === password,
  );
  return demoAccount?.user || null;
}

export async function login(
  email: string,
  password: string,
): Promise<User | null> {
  // First check if it's a demo account
  const demoUser = isDemoAccount(email, password);
  if (demoUser) {
    console.log("[Auth] Demo login successful for:", email);
    setCurrentUser(demoUser);
    localStorage.setItem("app:demo-mode", "true");
    return demoUser;
  }

  // Try MercurJS authentication
  try {
    const result = await authenticateUser(email, password);

    if (!result.success) {
      return null;
    }

    // Fetch the authenticated user data
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      clearAuthToken();
      return null;
    }

    // Map MercurJS admin user to our User type
    const user: User = {
      id: adminUser.id,
      name: `${adminUser.first_name || ""} ${adminUser.last_name || ""}`.trim(),
      email: adminUser.email,
      role: "admin", // Map based on adminUser role if available
      userRole: "admin",
    };

    localStorage.removeItem("app:demo-mode");
    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function logout(): Promise<void> {
  const isDemoMode = localStorage.getItem("app:demo-mode") === "true";

  if (isDemoMode) {
    // Demo mode - just clear local storage
    localStorage.removeItem("app:demo-mode");
    localStorage.removeItem("app:user");
    console.log("[Auth] Demo logout successful");
  } else {
    // Real MercurJS logout
    await logoutUser();
  }
}

export async function updateProfileName(name: string): Promise<User | null> {
  const u = getCurrentUser();
  if (!u) return null;
  const updated: User = { ...u, name };
  setCurrentUser(updated);
  return updated;
}

export async function changePassword(
  current: string,
  next: string,
): Promise<boolean> {
  // This would require implementing password change in MercurJS
  // For now, return false as we need the backend endpoint
  if (current.trim().length >= 3 && next.trim().length >= 6) {
    try {
      // TODO: Call MercurJS password change endpoint
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function register(data: {
  companyName: string;
  registrationNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  contactEmail: string;
  contactName: string;
  phone?: string;
}): Promise<RegistrationRequest> {
  return createRegistrationRequest(data);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("app:user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem("app:user", JSON.stringify(user));
  else localStorage.removeItem("app:user");
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
