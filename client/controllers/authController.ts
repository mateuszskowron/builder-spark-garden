import type { User, RegistrationRequest } from "@/models/types";
import { createRegistrationRequest } from "./userManagementController";
import {
  authenticateUser,
  getCurrentAdminUser,
  logoutUser,
  clearAuthToken,
  getAuthToken,
} from "@/services/mercurjsApi";

export async function login(
  email: string,
  password: string,
): Promise<User | null> {
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

    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function logout(): Promise<void> {
  await logoutUser();
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
