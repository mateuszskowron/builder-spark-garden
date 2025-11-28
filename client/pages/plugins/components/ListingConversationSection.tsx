import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getListingConversation,
  sendMessage,
  acceptTransactionProposal,
  rejectTransactionProposal,
} from "@/controllers/chatController";
import type { ChatMessage, TransactionProposal } from "@/models/types";

interface ListingConversationSectionProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
}

export function ListingConversationSection({
  listingId,
  sellerId,
  sellerName,
}: ListingConversationSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [proposals, setProposals] = useState<TransactionProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [listingId]);

  const loadConversation = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await getListingConversation(listingId, user.id);
      if (data) {
        setMessages(data.messages);
        setProposals(data.proposals);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: t("chat.loadError") || "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyText.trim() || !user) return;

    try {
      setIsReplying(true);
      // In a real app, would call sendMessage with chatId
      const newMessage: ChatMessage = {
        id: `msg${messages.length + 1}`,
        senderId: user.id,
        senderName: user.name,
        content: replyText,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setReplyText("");
      toast({
        title: "Success",
        description: t("chat.messageSent") || "Message sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t("chat.sendError") || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleAcceptOffer = async (proposalId: string) => {
    try {
      await acceptTransactionProposal(proposalId);
      setProposals(
        proposals.map((p) =>
          p.id === proposalId ? { ...p, status: "accepted" } : p,
        ),
      );
      toast({
        title: "Success",
        description: t("offers.accepted") || "Offer accepted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t("offers.acceptError") || "Failed to accept offer",
        variant: "destructive",
      });
    }
  };

  const handleRejectOffer = async (proposalId: string) => {
    try {
      await rejectTransactionProposal(proposalId);
      setProposals(
        proposals.map((p) =>
          p.id === proposalId ? { ...p, status: "rejected" } : p,
        ),
      );
      toast({
        title: "Success",
        description: t("offers.rejected") || "Offer rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t("offers.rejectError") || "Failed to reject offer",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("listings.conversation") || "Conversation"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("listings.conversation") || "Conversation"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {proposals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">{t("listings.offers") || "Offers"}</h3>
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {proposal.proposedBy === user?.id
                          ? "Your Offer"
                          : `Offer from ${sellerName}`}
                      </span>
                      <Badge variant={getStatusBadgeColor(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(proposal.proposedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{proposal.acceptedQuantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{proposal.proposedPrice}</p>
                  </div>
                </div>
                {proposal.status === "pending" &&
                  proposal.proposedTo === user?.id && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptOffer(proposal.id)}
                      >
                        {t("offers.accept") || "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectOffer(proposal.id)}
                      >
                        {t("offers.reject") || "Reject"}
                      </Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {proposals.length > 0 && messages.length > 0 && <Separator />}

        {messages.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">
              {t("listings.messages") || "Messages"}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      message.senderId === user?.id
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {message.senderName}
                    </p>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 && proposals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t("listings.noConversation") || "No conversation yet"}
          </div>
        )}

        {(messages.length > 0 || proposals.length > 0) && (
          <div className="pt-4 border-t">
            <form onSubmit={handleSendReply} className="flex gap-2">
              <Input
                placeholder={t("chat.messagePlaceholder") || "Type a message..."}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isReplying}
              />
              <Button type="submit" disabled={isReplying || !replyText.trim()}>
                {t("chat.send") || "Send"}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
