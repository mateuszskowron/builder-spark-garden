import type { Case } from "@/models/types";

const sampleCases: Case[] = [
  {
    id: "C-001",
    title: "Umowa najmu - przedłużenie",
    description: "Obsługa przedłużenia umowy najmu lokalu.",
    status: "open",
    createdAt: "2024-10-01T10:00:00.000Z",
    updatedAt: "2024-10-05T12:00:00.000Z",
  },
  {
    id: "C-002",
    title: "Reklamacja dostawy",
    description: "Opóźnienie i uszkodzenie towaru podczas transportu.",
    status: "inProgress",
    createdAt: "2024-09-20T09:15:00.000Z",
    updatedAt: "2024-10-03T08:30:00.000Z",
  },
  {
    id: "C-003",
    title: "Wygaśnięcie gwarancji",
    description: "Sprawdzenie warunków gwarancji dla sprzętu A.",
    status: "closed",
    createdAt: "2024-08-12T14:45:00.000Z",
    updatedAt: "2024-09-01T15:10:00.000Z",
  },
];

export async function fetchCases(): Promise<Case[]> {
  return delay(sampleCases, 300);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
