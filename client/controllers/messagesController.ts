import type { MessageThread } from "@/models/types";

const threads: MessageThread[] = [
  {
    id: "T-001",
    subject: "Pytanie o fakturę FV/2024/002",
    participants: [
      { id: "1", name: "Anna Kowalska", email: "anna@example.com" },
      { id: "2", name: "Obsługa", email: "support@example.com" },
    ],
    unreadCount: 1,
    messages: [
      {
        id: "M-1",
        author: { id: "1", name: "Anna Kowalska", email: "anna@example.com" },
        content: "Dzień dobry, kiedy otrzymam duplikat faktury?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: "M-2",
        author: { id: "2", name: "Obsługa", email: "support@example.com" },
        content: "Wysłaliśmy dziś rano, proszę sprawdzić skrzynkę.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
  },
  {
    id: "T-002",
    subject: "Termin serwisu",
    participants: [
      { id: "1", name: "Anna Kowalska", email: "anna@example.com" },
      { id: "2", name: "Obsługa", email: "support@example.com" },
    ],
    messages: [
      {
        id: "M-3",
        author: { id: "1", name: "Anna Kowalska", email: "anna@example.com" },
        content: "Czy możemy przełożyć serwis na przyszły tydzień?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      },
    ],
  },
];

export async function fetchThreads(): Promise<MessageThread[]> {
  return delay(threads, 200);
}

export async function sendMessage(threadId: string, content: string) {
  const t = threads.find((x) => x.id === threadId);
  if (!t) return delay(false, 50);
  t.messages.push({
    id: `M-${Math.random().toString(36).slice(2, 8)}`,
    author: { id: "1", name: "Anna Kowalska", email: "anna@example.com" },
    content,
    timestamp: new Date().toISOString(),
  });
  return delay(true, 100);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
