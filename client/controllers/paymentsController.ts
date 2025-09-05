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

export async function createPayment(input: {
  amount: number;
  currency: string;
  method: Payment["method"];
  reference: string;
}): Promise<Payment> {
  const p: Payment = {
    id: `P-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    status: "completed",
    reference: input.reference,
  };
  payments.unshift(p);
  return delay(p, 200);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
