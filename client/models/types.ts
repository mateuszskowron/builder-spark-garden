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

export type PluginDefinition = {
  id: PluginId;
  path: string; // route path
  titleKey: string; // i18n key
  icon?: React.ComponentType<{ className?: string }>;
};
