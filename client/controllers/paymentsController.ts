import type { Payment } from "@/models/types";

const payments: Payment[] = [
  {
    id: "P-001",
    date: "2024-10-02",
    amount: 499.0,
    currency: "PLN",
    method: "card",
    status: "completed",
    reference: "FV/2024/002",
  },
  {
    id: "P-002",
    date: "2024-09-15",
    amount: 219.5,
    currency: "PLN",
    method: "transfer",
    status: "pending",
    reference: "FV/2024/003",
  },
  {
    id: "P-003",
    date: "2024-08-10",
    amount: 1299.99,
    currency: "PLN",
    method: "blik",
    status: "failed",
    reference: "FV/2024/001",
  },
];

export async function fetchPayments(): Promise<Payment[]> {
  return delay(payments, 220);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
