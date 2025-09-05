import type { Invoice } from "@/models/types";

const invoices: Invoice[] = [
  {
    id: "I-2024-001",
    number: "FV/2024/001",
    issueDate: "2024-09-01",
    dueDate: "2024-09-14",
    amount: 1299.99,
    currency: "PLN",
    status: "paid",
  },
  {
    id: "I-2024-002",
    number: "FV/2024/002",
    issueDate: "2024-10-01",
    dueDate: "2024-10-14",
    amount: 499.0,
    currency: "PLN",
    status: "unpaid",
  },
  {
    id: "I-2024-003",
    number: "FV/2024/003",
    issueDate: "2024-10-10",
    dueDate: "2024-10-24",
    amount: 219.5,
    currency: "PLN",
    status: "overdue",
  },
];

export async function fetchInvoices(): Promise<Invoice[]> {
  return delay(invoices, 350);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
