export type Locale = "pl" | "en";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin";
};

export type CaseStatus = "open" | "inProgress" | "closed";

export type Case = {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export type Invoice = {
  id: string;
  number: string;
  issueDate: string; // ISO
  dueDate: string; // ISO
  amount: number;
  currency: string;
  status: InvoiceStatus;
};

export type PaymentStatus = "completed" | "pending" | "failed";
export type PaymentMethod = "card" | "transfer" | "blik" | "cash";

export type Payment = {
  id: string;
  date: string; // ISO
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
};

export type CalendarEventStatus = "planned" | "done" | "cancelled";
export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  status: CalendarEventStatus;
  location?: string;
  description?: string;
};

export type Message = {
  id: string;
  author: Pick<User, "id" | "name" | "email">;
  content: string;
  timestamp: string; // ISO
};

export type MessageThread = {
  id: string;
  subject: string;
  participants: Pick<User, "id" | "name" | "email">[];
  messages: Message[];
  unreadCount?: number;
};

export type PluginId =
  | "dashboard"
  | "cases"
  | "invoices"
  | "calendar"
  | "messages"
  | "documents"
  | "payments"
  | "complaints"
  | "reports"
  | "settings"
  | "account"
  | (string & {});

import type { ComponentType } from "react";

export type PluginDefinition = {
  id: PluginId;
  path: string; // route path
  titleKey: string; // i18n key
  icon?: ComponentType<{ className?: string }>;
};
