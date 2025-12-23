import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/state/AuthContext";
import type { Chat, ChatMessage } from "@/models/types";
import {
  getAllChats,
  getChatById,
  sendMessage,
  archiveChat,
  closeChat,
  searchChatHistory,
} from "@/controllers/chatController";
import {
  MessageSquare,
  Archive,
  X,
  Send,
  Search,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await getAllChats(user.id);
      setChats(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("chat.loadError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChat || !messageText.trim() || !user?.id) return;

    try {
      const newMessage = await sendMessage(
        selectedChat.id,
        user.id,
        user.name,
        messageText,
      );

      if (newMessage) {
        const updatedChat: Chat = {
          ...selectedChat,
          messages: [...selectedChat.messages, newMessage],
          lastMessageAt: newMessage.timestamp,
        };
        setSelectedChat(updatedChat);
        setChats(chats.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
        setMessageText("");
        toast({
          title: t("success"),
          description: t("chat.messageSent"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("chat.sendError"),
        variant: "destructive",
      });
    }
  };

  const handleArchiveChat = async (chat: Chat) => {
    try {
      const updated = await archiveChat(chat.id);
      if (updated) {
        setChats(chats.map((c) => (c.id === updated.id ? updated : c)));
        if (selectedChat?.id === chat.id) {
          setSelectedChat(updated);
        }
        toast({
          title: t("success"),
          description: t("chat.archived"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("chat.archiveError"),
        variant: "destructive",
      });
    }
  };

  const handleCloseChat = async (chat: Chat) => {
    try {
      const updated = await closeChat(chat.id);
      if (updated) {
        setChats(chats.map((c) => (c.id === updated.id ? updated : c)));
        if (selectedChat?.id === chat.id) {
          setSelectedChat(updated);
        }
        toast({
          title: t("success"),
          description: t("chat.closed"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("chat.closeError"),
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !searchText.trim()) {
      loadChats();
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchChatHistory(user.id, searchText);
      setChats(results);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("chat.searchError"),
        variant: "destructive",
      });
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participantIds.find((id) => id !== user?.id) || "Unknown";
  };

  const filteredChats = chats.filter((c) => c.status !== "archived");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("chat.title")}</h1>
        <p className="text-muted-foreground">{t("chat.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-96">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("chat.conversations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder={t("chat.search")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button size="sm" type="submit">
                <Search className="size-4" />
              </Button>
            </form>

            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    {t("loading")}
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    {t("chat.empty")}
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedChat?.id === chat.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {chat.listing?.productName || t("chat.unknownProduct")}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {chat.messages[chat.messages.length - 1]?.content ||
                          t("chat.noMessages")}
                      </div>
                      <div className="text-xs mt-1">
                        {new Date(chat.lastMessageAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedChat ? (
            <div className="flex flex-col h-full">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedChat.listing?.productName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.listing?.type === "sale"
                        ? t("chat.sellingProduct")
                        : t("chat.buyingProduct")}{" "}
                      - {selectedChat.listing?.price}{" "}
                      {selectedChat.listing?.currency}
                      {selectedChat.listing?.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchiveChat(selectedChat)}
                    >
                      <Archive className="size-4" />
                    </Button>
                    {selectedChat.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCloseChat(selectedChat)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {selectedChat.status !== "active" && (
                  <Badge variant="outline">{selectedChat.status}</Badge>
                )}
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pr-4">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.senderId === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.senderId !== user?.id && (
                          <p className="text-xs font-medium mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedChat.status === "active" && (
                <form
                  onSubmit={handleSendMessage}
                  className="border-t p-4 flex gap-2"
                >
                  <Input
                    placeholder={t("chat.messagePlaceholder")}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={selectedChat.status !== "active"}
                  />
                  <Button type="submit" size="icon" disabled={!messageText.trim()}>
                    <Send className="size-4" />
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="size-12 mx-auto mb-4 opacity-50" />
                <p>{t("chat.selectConversation")}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
