export type Locale = "pl" | "en";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin" | "company_admin" | "company_user";
  companyId?: string;
  companyName?: string;
  userRole?: UserRole;
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

// Company Management
export type UserRole = "admin" | "manager" | "buyer" | "seller" | "user";

export type Company = {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone?: string;
  createdAt: string; // ISO
  active: boolean;
};

export type CompanyUser = User & {
  companyId: string;
  role: UserRole;
  active: boolean;
  createdAt: string; // ISO
};

export type RegistrationRequest = {
  id: string;
  companyName: string;
  registrationNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  contactEmail: string;
  contactName: string;
  phone?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string; // ISO
  reviewedAt?: string; // ISO
  reviewedBy?: string; // User ID
  rejectionReason?: string;
};

// Listings and Products
export type ProductCategory = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string; // ISO
};

export type ListingStatus = "draft" | "pending_approval" | "approved" | "archived" | "rejected";

export type Listing = {
  id: string;
  companyId: string;
  companyName: string;
  type: "sale" | "purchase";
  productName: string;
  productCategory: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  quantity?: number;
  location: string;
  city: string;
  country: string;
  imageUrl?: string;
  status: ListingStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  expiresAt?: string; // ISO
  createdBy: string; // User ID
  moderationNotes?: string;
  rejectionReason?: string;
};

export type ListingDetail = Listing & {
  seller?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  chatStatus?: "none" | "active" | "completed";
};

// Chat and Transactions
export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string; // ISO
  attachments?: string[]; // File URLs
};

export type Chat = {
  id: string;
  participantIds: string[]; // Should be 2 for 1-on-1 chat
  listingId: string;
  listing?: Pick<Listing, "id" | "productName" | "type" | "price" | "currency">;
  messages: ChatMessage[];
  lastMessageAt: string; // ISO
  status: "active" | "archived" | "completed";
  createdAt: string; // ISO
};

export type TransactionProposal = {
  id: string;
  chatId: string;
  proposedBy: string; // User ID
  proposedTo: string; // User ID
  acceptedQuantity: number;
  proposedPrice: number;
  proposedAt: string; // ISO
  acceptedAt?: string; // ISO
  rejectedAt?: string; // ISO
  status: "pending" | "accepted" | "rejected";
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
  | "user-management"
  | "companies"
  | "registration-requests"
  | "listings"
  | "my-listings"
  | "sales"
  | "purchases"
  | "chat"
  | "contact"
  | (string & {});

import type { ComponentType } from "react";

export type PluginDefinition = {
  id: PluginId;
  path: string; // route path
  titleKey: string; // i18n key
  icon?: ComponentType<{ className?: string }>;
  requiredRole?: UserRole[]; // If specified, only users with these roles can access
};
