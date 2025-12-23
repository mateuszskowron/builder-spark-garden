import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  getUserOffers,
  acceptTransactionProposal,
  rejectTransactionProposal,
} from "@/controllers/chatController";
import type { TransactionProposal } from "@/models/types";

interface EnrichedOffer extends TransactionProposal {
  chatId: string;
  listingId: string;
  productName: string;
  type: "sale" | "purchase";
}

export default function OffersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<EnrichedOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await getUserOffers(user.id);
      setOffers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: t("offers.loadError") || "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAndSortedOffers = () => {
    let filtered = [...offers];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    // Filter by type (sent or received)
    if (filterType !== "all") {
      if (filterType === "sent") {
        filtered = filtered.filter((o) => o.proposedBy === user?.id);
      } else if (filterType === "received") {
        filtered = filtered.filter((o) => o.proposedTo === user?.id);
      }
    }

    // Search
    if (searchText) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.productName.toLowerCase().includes(text) ||
          o.listingId.toLowerCase().includes(text),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.proposedAt).getTime() -
            new Date(a.proposedAt).getTime()
          );
        case "price":
          return b.proposedPrice - a.proposedPrice;
        case "quantity":
          return b.acceptedQuantity - a.acceptedQuantity;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const groupOffersByListing = (offersList: EnrichedOffer[]) => {
    const grouped: { [key: string]: EnrichedOffer[] } = {};
    offersList.forEach((offer) => {
      if (!grouped[offer.listingId]) {
        grouped[offer.listingId] = [];
      }
      grouped[offer.listingId].push(offer);
    });
    return grouped;
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptTransactionProposal(offerId);
      setOffers(
        offers.map((o) =>
          o.id === offerId ? { ...o, status: "accepted" } : o,
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

  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectTransactionProposal(offerId);
      setOffers(
        offers.map((o) =>
          o.id === offerId ? { ...o, status: "rejected" } : o,
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

  const getStatusColor = (status: string) => {
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
        return t("offers.pending");
      case "accepted":
        return t("offers.accepted");
      case "rejected":
        return t("offers.rejected");
      default:
        return status;
    }
  };

  const filteredOffers = getFilteredAndSortedOffers();
  const groupedOffers = groupOffersByListing(filteredOffers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("offers.title") || "My Offers"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("offers.description") ||
            "View and manage all your sent and received offers"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("offers.filters.title") || "Filters & Sorting"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("offers.filters.search") || "Search"}
              </label>
              <Input
                placeholder={t("offers.filters.searchPlaceholder") || "Search by product or ID..."}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("offers.filters.type") || "Type"}
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("offers.filters.all") || "All"}
                  </SelectItem>
                  <SelectItem value="sent">
                    {t("offers.filters.sent") || "Sent Offers"}
                  </SelectItem>
                  <SelectItem value="received">
                    {t("offers.filters.received") || "Received Offers"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("offers.filters.status") || "Status"}
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("offers.filters.all") || "All"}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("offers.filters.pending") || "Pending"}
                  </SelectItem>
                  <SelectItem value="accepted">
                    {t("offers.filters.accepted") || "Accepted"}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {t("offers.filters.rejected") || "Rejected"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("offers.filters.sortBy") || "Sort By"}
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">
                    {t("offers.filters.sortDate") || "Date (Newest)"}
                  </SelectItem>
                  <SelectItem value="price">
                    {t("offers.filters.sortPrice") || "Price (Highest)"}
                  </SelectItem>
                  <SelectItem value="quantity">
                    {t("offers.filters.sortQuantity") || "Quantity (Highest)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">{t("loading")}</div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("offers.empty") || "No offers found"}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedOffers).map(([listingId, groupOffers]) => (
            <Card key={listingId}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {groupOffers[0]?.productName || "Unknown Product"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {offer.proposedBy === user?.id
                                ? t("offers.yourOffer") || "Your Offer"
                                : t("offers.receivedOffer") || "Received Offer"}
                            </span>
                            <Badge variant={getStatusColor(offer.status)}>
                              {getStatusLabel(offer.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("offers.createdAt")}:{" "}
                            {new Date(offer.proposedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {t("listings.quantity")}
                          </p>
                          <p className="font-medium">{offer.acceptedQuantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("listings.price")}
                          </p>
                          <p className="font-medium">{offer.proposedPrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("offers.deliveryDate")}
                          </p>
                          <p className="font-medium">-</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("offers.status")}
                          </p>
                          <p className="font-medium">{getStatusLabel(offer.status)}</p>
                        </div>
                      </div>

                      {offer.status === "pending" &&
                        offer.proposedTo === user?.id && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptOffer(offer.id)}
                            >
                              {t("offers.accept") || "Accept"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectOffer(offer.id)}
                            >
                              {t("offers.reject") || "Reject"}
                            </Button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
