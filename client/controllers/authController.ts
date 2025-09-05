import type { User } from "@/models/types";

// Mock users database
const users: User[] = [
  { id: "1", name: "Anna Kowalska", email: "anna@example.com", role: "client" },
  { id: "2", name: "John Doe", email: "john@example.com", role: "admin" },
];

export async function login(email: string, password: string): Promise<User | null> {
  // Mock credential check: any non-empty password works for existing user
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (user && password.trim().length >= 3) return delay(user, 400);
  return delay(null, 300);
}

export async function logout(): Promise<void> {
  return delay(undefined, 100);
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
