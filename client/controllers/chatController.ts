import type { Chat, ChatMessage, TransactionProposal } from "@/models/types";
import { getOrderById, getOrders } from "@/services/mercurjsApi";

// In-memory cache for chats since MercurJS might not have a dedicated messaging API
// This could be replaced with a real messaging service integration
const chatsCache: Map<string, Chat> = new Map();
const transactionProposalsCache: Map<string, TransactionProposal> = new Map();

// Chats Management
export async function getAllChats(userId: string): Promise<Chat[]> {
  try {
    // Fetch user's orders to get chat-related information
    const response = await getOrders({ limit: 100 });
    const orders = response.orders || [];

    // Map orders to chats for now
    const chats = orders
      .filter(
        (order: any) =>
          order.customer_id === userId || order.seller_id === userId,
      )
      .map((order: any) => {
        const chatId = `chat_${order.id}`;
        const cached = chatsCache.get(chatId);

        return (
          cached || {
            id: chatId,
            participantIds: [order.customer_id, order.seller_id],
            listingId: order.line_items?.[0]?.product_id || "",
            messages: [],
            lastMessageAt: order.updated_at,
            status: "active" as const,
            createdAt: order.created_at,
          }
        );
      });

    return chats;
  } catch (error) {
    console.error("Failed to get chats:", error);
    return [];
  }
}

export async function getChatById(id: string): Promise<Chat | null> {
  const cached = chatsCache.get(id);
  if (cached) return cached;
  return null;
}

export async function getChatByListingAndUsers(
  listingId: string,
  userId1: string,
  userId2: string,
): Promise<Chat | null> {
  try {
    const response = await getOrders({ limit: 100 });
    const order = (response.orders || []).find(
      (o: any) =>
        (o.customer_id === userId1 || o.customer_id === userId2) &&
        (o.seller_id === userId1 || o.seller_id === userId2),
    );

    if (!order) {
      // Create a new chat if no order exists
      return createNewChat(listingId, userId1, userId2);
    }

    const chatId = `chat_${order.id}`;
    const cached = chatsCache.get(chatId);

    if (cached) return cached;

    const chat: Chat = {
      id: chatId,
      participantIds: [userId1, userId2],
      listingId: listingId,
      messages: [],
      lastMessageAt: order.updated_at,
      status: "active",
      createdAt: order.created_at,
    };

    chatsCache.set(chatId, chat);
    return chat;
  } catch (error) {
    console.error("Failed to get chat by listing and users:", error);
    return null;
  }
}

export async function createChat(data: {
  listingId: string;
  participantIds: string[];
  userId: string;
  userName: string;
}): Promise<Chat> {
  return createNewChat(
    data.listingId,
    data.participantIds[0],
    data.participantIds[1],
  );
}

function createNewChat(
  listingId: string,
  userId1: string,
  userId2: string,
): Chat {
  const chatId = `chat_${Date.now()}`;
  const chat: Chat = {
    id: chatId,
    participantIds: [userId1, userId2],
    listingId: listingId,
    messages: [
      {
        id: `msg_${Date.now()}`,
        senderId: userId1,
        senderName: "User",
        content: "Cześć, czy jesteś zainteresowany tą ofertą?",
        timestamp: new Date().toISOString(),
      },
    ],
    lastMessageAt: new Date().toISOString(),
    status: "active",
    createdAt: new Date().toISOString(),
  };

  chatsCache.set(chatId, chat);
  return chat;
}

export async function sendMessage(
  chatId: string,
  userId: string,
  userName: string,
  content: string,
  attachments?: string[],
): Promise<ChatMessage | null> {
  const chat = chatsCache.get(chatId);
  if (!chat) return null;

  if (!chat.participantIds.includes(userId)) {
    return null;
  }

  const message: ChatMessage = {
    id: `msg_${Date.now()}`,
    senderId: userId,
    senderName: userName,
    content,
    timestamp: new Date().toISOString(),
    attachments,
  };

  chat.messages.push(message);
  chat.lastMessageAt = message.timestamp;

  return message;
}

export async function searchChatHistory(
  userId: string,
  searchText: string,
): Promise<Chat[]> {
  const userChats = await getAllChats(userId);

  const filtered = userChats.filter((chat) => {
    const cachedChat = chatsCache.get(chat.id);
    if (!cachedChat) return false;

    return cachedChat.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchText.toLowerCase()),
    );
  });

  return filtered;
}

export async function archiveChat(chatId: string): Promise<Chat | null> {
  const chat = chatsCache.get(chatId);
  if (!chat) return null;
  chat.status = "archived";
  chatsCache.set(chatId, chat);
  return { ...chat };
}

export async function closeChat(chatId: string): Promise<Chat | null> {
  const chat = chatsCache.get(chatId);
  if (!chat) return null;
  chat.status = "completed";
  chatsCache.set(chatId, chat);
  return { ...chat };
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
    id: `prop_${Date.now()}`,
    ...data,
    proposedAt: new Date().toISOString(),
    status: "pending",
  };
  transactionProposalsCache.set(proposal.id, proposal);
  return proposal;
}

export async function getTransactionProposals(
  chatId: string,
): Promise<TransactionProposal[]> {
  const proposals = Array.from(transactionProposalsCache.values()).filter(
    (p) => p.chatId === chatId,
  );
  return proposals;
}

export async function acceptTransactionProposal(
  proposalId: string,
): Promise<TransactionProposal | null> {
  const proposal = transactionProposalsCache.get(proposalId);
  if (!proposal) return null;
  proposal.status = "accepted";
  proposal.acceptedAt = new Date().toISOString();
  transactionProposalsCache.set(proposalId, proposal);
  return { ...proposal };
}

export async function rejectTransactionProposal(
  proposalId: string,
): Promise<TransactionProposal | null> {
  const proposal = transactionProposalsCache.get(proposalId);
  if (!proposal) return null;
  proposal.status = "rejected";
  proposal.rejectedAt = new Date().toISOString();
  transactionProposalsCache.set(proposalId, proposal);
  return { ...proposal };
}

// Get offers and messages for a specific listing
export async function getListingConversation(
  listingId: string,
  userId: string,
): Promise<{ messages: ChatMessage[]; proposals: TransactionProposal[] } | null> {
  const userChats = Array.from(chatsCache.values());
  const chat = userChats.find(
    (c) => c.listingId === listingId && c.participantIds.includes(userId),
  );
  if (!chat) return null;

  const proposals = Array.from(transactionProposalsCache.values()).filter(
    (p) => p.chatId === chat.id,
  );
  return {
    messages: [...chat.messages],
    proposals: [...proposals],
  };
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
  const userChats = Array.from(chatsCache.values()).filter((c) =>
    c.participantIds.includes(userId),
  );
  const userProposals = Array.from(transactionProposalsCache.values()).filter(
    (p) => p.proposedBy === userId || p.proposedTo === userId,
  );

  const enriched = userProposals.map((proposal) => {
    const chat = userChats.find((c) => c.id === proposal.chatId);

    return {
      ...proposal,
      chatId: proposal.chatId,
      listingId: chat?.listingId || "",
      productName: "Unknown Product",
      type: ("purchase" as const),
    };
  });

  return enriched;
}
