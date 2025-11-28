import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";
import type { ListingDetail } from "@/models/types";
import { getListingById } from "@/controllers/listingsController";
import { ContactSellerDialog } from "./dialogs/ContactSellerDialog";
import { MakeOfferDialog } from "./dialogs/MakeOfferDialog";
import { ListingConversationSection } from "./components/ListingConversationSection";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "Listing ID is missing",
        variant: "destructive",
      });
      navigate("/sales");
      return;
    }

    try {
      setIsLoading(true);
      const data = await getListingById(id);
      if (!data) {
        toast({
          title: "Error",
          description: "Listing not found",
          variant: "destructive",
        });
        navigate("/sales");
        return;
      }
      setListing(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive",
      });
      navigate("/sales");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending_approval":
        return "outline";
      case "archived":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Active";
      case "pending_approval":
        return "Pending Review";
      case "archived":
        return "Archived";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Button>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Button>
        <div className="text-center py-8 text-muted-foreground">
          {t("listings.notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {listing && (
            <ListingConversationSection
              listingId={listing.id}
              sellerId={listing.seller?.id || ""}
              sellerName={listing.seller?.name || ""}
            />
          )}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl">
                    {listing.productName}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {listing.description}
                  </p>
                </div>
                <Badge variant={getStatusColor(listing.status)}>
                  {getStatusLabel(listing.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("listings.price")}
                  </p>
                  <p className="text-2xl font-bold">
                    {listing.price} {listing.currency}/{listing.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("listings.quantity")}
                  </p>
                  <p className="text-2xl font-bold">
                    {listing.quantity || "N/A"} {listing.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("listings.details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("listings.type")}
                  </p>
                  <p className="font-medium capitalize">
                    {listing.type === "sale"
                      ? t("listings.sale")
                      : t("listings.purchase")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("listings.category")}
                  </p>
                  <p className="font-medium">{listing.productCategory}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("listings.location")}
                  </p>
                  <div className="flex items-center gap-1 font-medium">
                    <MapPin className="size-4" />
                    {listing.city}, {listing.country}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("listings.address")}
                  </p>
                  <p className="font-medium">{listing.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("listings.timeline")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("listings.createdAt")}:
                </span>
                <span className="font-medium">
                  {new Date(listing.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("listings.updatedAt")}:
                </span>
                <span className="font-medium">
                  {new Date(listing.updatedAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("listings.seller")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("listings.company")}
                </p>
                <p className="font-semibold text-lg">{listing.seller.name}</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <a
                    href={`mailto:${listing.seller.email}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {listing.seller.email}
                  </a>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => setContactDialogOpen(true)}
              >
                {t("listings.contactSeller")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("listings.actions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOfferDialogOpen(true)}
              >
                {t("listings.makeOffer")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {listing && (
        <>
          <ContactSellerDialog
            open={contactDialogOpen}
            onOpenChange={setContactDialogOpen}
            listing={listing}
          />
          <MakeOfferDialog
            open={offerDialogOpen}
            onOpenChange={setOfferDialogOpen}
            listing={listing}
          />
        </>
      )}
    </div>
  );
}
