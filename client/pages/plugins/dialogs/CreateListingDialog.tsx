import { useState } from "react";
// useEffect removed - categories are now loaded synchronously
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createListing, DEFAULT_CATEGORIES } from "@/controllers/listingsController";
import type { ProductCategory } from "@/models/types";

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListingCreated?: () => void;
}

export function CreateListingDialog({
  open,
  onOpenChange,
  onListingCreated,
}: CreateListingDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState<"sale" | "purchase">("sale");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  // Use default categories directly - no loading needed
  const categories: ProductCategory[] = DEFAULT_CATEGORIES;
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingCategories = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.companyId) {
      toast({
        title: "Error",
        description: t("listings.companyRequired") || "Company not found",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!productName.trim()) {
      toast({
        title: "Error",
        description: t("validation.productNameRequired") || "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: t("validation.categoryRequired") || "Category is required",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Error",
        description: t("validation.descriptionRequired") || "Description is required",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (!price.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Error",
        description: t("validation.priceRequired") || "Price must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (!unit.trim()) {
      toast({
        title: "Error",
        description: t("validation.unitRequired") || "Unit is required",
        variant: "destructive",
      });
      return;
    }

    if (quantity && isNaN(parseFloat(quantity))) {
      toast({
        title: "Error",
        description: t("validation.quantityInvalid") || "Quantity must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "Error",
        description: t("validation.locationRequired") || "Location is required",
        variant: "destructive",
      });
      return;
    }

    if (!city.trim()) {
      toast({
        title: "Error",
        description: t("validation.cityRequired") || "City is required",
        variant: "destructive",
      });
      return;
    }

    if (!country.trim()) {
      toast({
        title: "Error",
        description: t("validation.countryRequired") || "Country is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      await createListing({
        companyId: user.companyId,
        companyName: user.companyName || user.name,
        type,
        productName,
        productCategory: category,
        description,
        price: priceNum,
        currency: "PLN",
        unit,
        quantity: quantity ? parseFloat(quantity) : undefined,
        location,
        city,
        country,
        createdBy: user.id,
      });

      toast({
        title: "Success",
        description: t("listings.created") || "Listing created successfully",
      });

      // Reset form
      setProductName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setUnit("kg");
      setQuantity("");
      setLocation("");
      setCity("");
      setCountry("");
      setType("sale");

      onOpenChange(false);
      onListingCreated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: t("listings.createError") || "Failed to create listing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("listings.create.title") || "Create New Listing"}</DialogTitle>
          <DialogDescription>
            {t("listings.create.description") || "Add a new listing for your products"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">{t("listings.type")}</Label>
              <Select value={type} onValueChange={(value) => setType(value as "sale" | "purchase")}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">{t("listings.sale")}</SelectItem>
                  <SelectItem value="purchase">{t("listings.purchase")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">{t("listings.category")}</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoadingCategories}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("listings.selectCategory") || "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="productName">{t("listings.productName")}</Label>
            <Input
              id="productName"
              placeholder={t("listings.productNamePlaceholder") || "e.g., Organic Tomatoes"}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t("listings.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("listings.descriptionPlaceholder") || "Describe your product..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t("listings.price")}</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">{t("listings.unit")}</Label>
              <Input
                id="unit"
                placeholder="kg, piece, etc."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">{t("listings.quantity")} ({t("listings.optional")})</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.01"
              min="0"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">{t("listings.city")}</Label>
              <Input
                id="city"
                placeholder="e.g., Warsaw"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="country">{t("listings.country")}</Label>
              <Input
                id="country"
                placeholder="e.g., Poland"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">{t("listings.location")}</Label>
            <Input
              id="location"
              placeholder={t("listings.addressPlaceholder") || "e.g., Street 10, Building A"}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
              required
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
              {isLoading ? "Creating..." : t("listings.create.submit") || "Create Listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
