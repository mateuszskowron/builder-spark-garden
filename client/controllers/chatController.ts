import type { Chat, ChatMessage, TransactionProposal } from "@/models/types";
import { getOrderById, getOrders } from "@/services/mercurjsApi";

// In-memory cache for chats since MercurJS might not have a dedicated messaging API
// This could be replaced with a real messaging service integration
const chatsCache: Map<string, Chat> = new Map();
const transactionProposalsCache: Map<string, TransactionProposal> = new Map();

// Chats Management
export async function getAllChats(userId: string): Promise<Chat[]> {
  const userChats = chats.filter((c) =>
    c.participantIds.includes(userId),
  );
  return delay([...userChats], 200);
}

export async function getChatById(id: string): Promise<Chat | null> {
  const chat = chats.find((c) => c.id === id);
  return delay(chat ? { ...chat } : null, 100);
}

export async function getChatByListingAndUsers(
  listingId: string,
  userId1: string,
  userId2: string,
): Promise<Chat | null> {
  const chat = chats.find(
    (c) =>
      c.listingId === listingId &&
      c.participantIds.includes(userId1) &&
      c.participantIds.includes(userId2),
  );
  return delay(chat ? { ...chat } : null, 100);
}

export async function createChat(data: {
  listingId: string;
  participantIds: string[];
  userId: string;
  userName: string;
}): Promise<Chat> {
  // Check if chat already exists
  const existing = chats.find(
    (c) =>
      c.listingId === data.listingId &&
      c.participantIds.every((pid) => data.participantIds.includes(pid)),
  );

  if (existing) {
    return delay(existing, 100);
  }

  const chat: Chat = {
    id: `chat${chats.length + 1}`,
    participantIds: data.participantIds,
    listingId: data.listingId,
    messages: [
      {
        id: `msg${chats.length}_1`,
        senderId: data.userId,
        senderName: data.userName,
        content: "Cześć, czy jesteś zainteresowany tą ofertą?",
        timestamp: new Date().toISOString(),
      },
    ],
    lastMessageAt: new Date().toISOString(),
    status: "active",
    createdAt: new Date().toISOString(),
  };

  chats.push(chat);
  return delay(chat, 200);
}

export async function sendMessage(
  chatId: string,
  userId: string,
  userName: string,
  content: string,
  attachments?: string[],
): Promise<ChatMessage | null> {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return delay(null, 100);

  if (!chat.participantIds.includes(userId)) {
    return delay(null, 100);
  }

  const message: ChatMessage = {
    id: `msg${chat.messages.length + 1}`,
    senderId: userId,
    senderName: userName,
    content,
    timestamp: new Date().toISOString(),
    attachments,
  };

  chat.messages.push(message);
  chat.lastMessageAt = message.timestamp;

  return delay(message, 200);
}

export async function searchChatHistory(
  userId: string,
  searchText: string,
): Promise<Chat[]> {
  const userChats = chats.filter((c) =>
    c.participantIds.includes(userId),
  );

  const filtered = userChats.filter((chat) =>
    chat.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchText.toLowerCase()),
    ),
  );

  return delay(filtered, 300);
}

export async function archiveChat(chatId: string): Promise<Chat | null> {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return delay(null, 100);
  chat.status = "archived";
  return delay({ ...chat }, 150);
}

export async function closeChat(chatId: string): Promise<Chat | null> {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return delay(null, 100);
  chat.status = "completed";
  return delay({ ...chat }, 150);
}

// Transaction Proposals
export async function createTransactionProposal(data: {
  chatId: string;
  proposedBy: string;
  proposedTo: string;
  acceptedQuantity: number;
  proposedPrice: number;
}): Promise<TransactionProposal> {
  const proposal: TransactionProposal = {
    id: `prop${transactionProposals.length + 1}`,
    ...data,
    proposedAt: new Date().toISOString(),
    status: "pending",
  };
  transactionProposals.push(proposal);
  return delay(proposal, 200);
}

export async function getTransactionProposals(
  chatId: string,
): Promise<TransactionProposal[]> {
  const proposals = transactionProposals.filter((p) => p.chatId === chatId);
  return delay([...proposals], 150);
}

export async function acceptTransactionProposal(
  proposalId: string,
): Promise<TransactionProposal | null> {
  const proposal = transactionProposals.find((p) => p.id === proposalId);
  if (!proposal) return delay(null, 100);
  proposal.status = "accepted";
  proposal.acceptedAt = new Date().toISOString();
  return delay({ ...proposal }, 150);
}

export async function rejectTransactionProposal(
  proposalId: string,
): Promise<TransactionProposal | null> {
  const proposal = transactionProposals.find((p) => p.id === proposalId);
  if (!proposal) return delay(null, 100);
  proposal.status = "rejected";
  proposal.rejectedAt = new Date().toISOString();
  return delay({ ...proposal }, 150);
}

// Get offers and messages for a specific listing
export async function getListingConversation(
  listingId: string,
  userId: string,
): Promise<{ messages: ChatMessage[]; proposals: TransactionProposal[] } | null> {
  const chat = chats.find(
    (c) => c.listingId === listingId && c.participantIds.includes(userId),
  );
  if (!chat) return delay(null, 100);

  const proposals = transactionProposals.filter((p) => p.chatId === chat.id);
  return delay(
    {
      messages: [...chat.messages],
      proposals: [...proposals],
    },
    150,
  );
}

// Get all user offers (both sent and received)
export async function getUserOffers(
  userId: string,
): Promise<
  Array<
    TransactionProposal & {
      chatId: string;
      listingId: string;
      productName: string;
      type: "sale" | "purchase";
    }
  >
> {
  const userChats = chats.filter((c) => c.participantIds.includes(userId));
  const userProposals = transactionProposals.filter(
    (p) =>
      p.proposedBy === userId ||
      p.proposedTo === userId,
  );

  const enriched = userProposals.map((proposal) => {
    const chat = userChats.find((c) => c.id === proposal.chatId);
    const listing = chats.find((c) => c.id === proposal.chatId)?.listing;

    return {
      ...proposal,
      chatId: proposal.chatId,
      listingId: chat?.listingId || "",
      productName: listing?.productName || "Unknown Product",
      type: listing?.type || ("purchase" as const),
    };
  });

  return delay(enriched, 300);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
