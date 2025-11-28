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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createChat,
  sendMessage,
  createTransactionProposal,
} from "@/controllers/chatController";
import type { ListingDetail } from "@/models/types";

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingDetail;
}

export function MakeOfferDialog({
  open,
  onOpenChange,
  listing,
}: MakeOfferDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(listing.price.toString());
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !listing.seller) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(price);

    // Validation
    if (!quantity.trim() || isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Error",
        description: t("validation.quantityRequired") || "Quantity must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (!price.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Error",
        description: t("validation.priceRequired") || "Price must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryDate.trim()) {
      toast({
        title: "Error",
        description: t("validation.deliveryDateRequired") || "Delivery date is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create or get existing chat
      const chat = await createChat({
        listingId: listing.id,
        participantIds: [user.id, listing.seller.id],
        userId: user.id,
        userName: user.name,
      });

      // Create offer message with translations
      const offerLabel = t("listings.makeOffer") || "Make an Offer";
      const quantityLabel = t("listings.quantity") || "Quantity";
      const priceLabel = t("listings.price") || "Price";
      const deliveryLabel = t("listings.deliveryDate") || "Delivery Date";
      const notesLabel = t("listings.notes") || "Notes";
      const offerMessage = `${offerLabel} ${listing.productName}:\n${quantityLabel}: ${quantity} ${listing.unit}\n${priceLabel}: ${price} ${listing.currency}\n${deliveryLabel}: ${deliveryDate}${notes ? `\n\n${notesLabel}: ${notes}` : ""}`;

      await sendMessage(chat.id, user.id, user.name, offerMessage);

      // Create transaction proposal
      await createTransactionProposal({
        chatId: chat.id,
        proposedBy: user.id,
        proposedTo: listing.seller.id,
        acceptedQuantity: quantityNum,
        proposedPrice: priceNum,
      });

      toast({
        title: "Success",
        description: t("listings.offerSent") || "Offer sent successfully",
      });

      // Reset form
      setQuantity("");
      setPrice(listing.price.toString());
      setDeliveryDate("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: t("listings.offerError") || "Failed to send offer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("listings.makeOffer")}</DialogTitle>
          <DialogDescription>
            {t("listings.makeOfferDescription") ||
              `Make an offer for ${listing.productName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("listings.product")}</Label>
            <p className="text-sm font-medium">{listing.productName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {t("listings.quantity")} ({listing.unit})
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.01"
              min="0"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              {t("listings.price")} ({listing.currency})
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g., 100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">
              {t("listings.deliveryDate") || "Delivery Date"}
            </Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("listings.notes") || "Notes (Optional)"}</Label>
            <Textarea
              id="notes"
              placeholder={t("listings.notesPlaceholder") || "Add any additional notes..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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
              {isLoading ? "Sending..." : t("listings.makeOffer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
