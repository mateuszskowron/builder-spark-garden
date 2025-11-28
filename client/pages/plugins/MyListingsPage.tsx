import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/state/AuthContext";
import type { Listing } from "@/models/types";
import {
  getCompanyListings,
  updateListing,
  archiveListing,
  restoreListing,
} from "@/controllers/listingsController";
import { Edit2, Archive, RotateCcw, Eye } from "lucide-react";

export default function MyListingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "You must be associated with a company",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await getCompanyListings(user.companyId);
      setListings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveListing = async (listing: Listing) => {
    try {
      const updated = await archiveListing(listing.id);
      if (updated) {
        setListings(
          listings.map((l) => (l.id === updated.id ? updated : l)),
        );
        toast({
          title: "Success",
          description: "Listing archived",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive listing",
        variant: "destructive",
      });
    }
  };

  const handleRestoreListing = async (listing: Listing) => {
    try {
      const updated = await restoreListing(listing.id);
      if (updated) {
        setListings(
          listings.map((l) => (l.id === updated.id ? updated : l)),
        );
        toast({
          title: "Success",
          description: "Listing restored",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore listing",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Listing["status"]) => {
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

  const getStatusLabel = (status: Listing["status"]) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("listings.myListings.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("listings.myListings.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("listings.myListings.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("listings.myListings.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("listings.productName")}</TableHead>
                    <TableHead>{t("listings.type")}</TableHead>
                    <TableHead>{t("listings.price")}</TableHead>
                    <TableHead>{t("listings.location")}</TableHead>
                    <TableHead>{t("listings.status")}</TableHead>
                    <TableHead>{t("listings.createdAt")}</TableHead>
                    <TableHead>{t("listings.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">
                        {listing.productName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {listing.type === "sale"
                            ? t("listings.sale")
                            : t("listings.purchase")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {listing.price} {listing.currency}/{listing.unit}
                      </TableCell>
                      <TableCell>
                        {listing.city}, {listing.country}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(listing.status)}>
                          {getStatusLabel(listing.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View details"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {listing.status !== "archived" &&
                          listing.status !== "rejected" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit"
                              >
                                <Edit2 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveListing(listing)}
                              >
                                <Archive className="size-4" />
                              </Button>
                            </>
                          )}
                        {listing.status === "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestoreListing(listing)}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
