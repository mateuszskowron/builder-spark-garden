import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createChat, sendMessage } from "@/controllers/chatController";
import type { ListingDetail } from "@/models/types";

interface ContactSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingDetail;
}

export function ContactSellerDialog({
  open,
  onOpenChange,
  listing,
}: ContactSellerDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !listing.seller) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Error",
        description: t("validation.messageRequired") || "Message is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const chat = await createChat({
        listingId: listing.id,
        participantIds: [user.id, listing.seller.id],
        userId: user.id,
        userName: user.name,
      });

      await sendMessage(chat.id, user.id, user.name, message);

      toast({
        title: "Success",
        description: t("chat.messageSent") || "Message sent successfully",
      });

      setMessage("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: t("chat.sendError") || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("listings.contactSeller")}</DialogTitle>
          <DialogDescription>
            {t("listings.contactSellerDescription") ||
              `Send a message to ${listing.seller.name} about ${listing.productName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("listings.seller")}</Label>
            <p className="text-sm font-medium">{listing.seller.name}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("listings.product")}</Label>
            <p className="text-sm font-medium">{listing.productName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t("chat.message") || "Message"}</Label>
            <Textarea
              id="message"
              placeholder={t("chat.messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : t("chat.send") || "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
