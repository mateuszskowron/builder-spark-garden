import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/state/AuthContext";
import type { Listing, ProductCategory } from "@/models/types";
import {
  getSalesListings,
  getAllProductCategories,
  createListing,
} from "@/controllers/listingsController";
import { Plus, MessageSquare, MapPin, Calendar } from "lucide-react";

export default function SalesListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [filters, setFilters] = useState({
    searchText: "",
    city: "",
    country: "",
    category: "",
    sortBy: "date" as "name" | "price" | "date" | "category",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [formData, setFormData] = useState({
    productName: "",
    productCategory: "",
    description: "",
    price: "",
    unit: "",
    quantity: "",
    location: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [listingsData, categoriesData] = await Promise.all([
        getSalesListings(filters),
        getAllProductCategories(),
      ]);
      setListings(listingsData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const data = await getSalesListings(filters);
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

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.productName ||
      !formData.productCategory ||
      !formData.price ||
      !formData.unit ||
      !formData.city ||
      !formData.country
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "You must be associated with a company",
        variant: "destructive",
      });
      return;
    }

    try {
      const newListing = await createListing({
        companyId: user.companyId,
        companyName: user.companyName || "Unknown",
        type: "sale",
        productName: formData.productName,
        productCategory: formData.productCategory,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: "PLN",
        unit: formData.unit,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        location: formData.location,
        city: formData.city,
        country: formData.country,
        createdBy: user.id,
      });

      setListings([...listings, newListing]);
      setIsDialogOpen(false);
      setFormData({
        productName: "",
        productCategory: "",
        description: "",
        price: "",
        unit: "",
        quantity: "",
        location: "",
        city: "",
        country: "",
      });

      toast({
        title: "Success",
        description: "Sales listing created and awaiting approval",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchText: "",
      city: "",
      country: "",
      category: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("listings.sales.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("listings.sales.description")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              {t("listings.sales.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("listings.sales.addTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <Label htmlFor="productName">
                  {t("listings.productName")}*
                </Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productName: e.target.value,
                    })
                  }
                  placeholder="e.g., Tomatoes"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">{t("listings.category")}*</Label>
                <Select
                  value={formData.productCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productCategory: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">
                  {t("listings.description")}
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description"
                  className="w-full px-3 py-2 border rounded-md min-h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t("listings.price")}*</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value,
                      })
                    }
                    placeholder="Price"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">{t("listings.unit")}*</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit: e.target.value,
                      })
                    }
                    placeholder="e.g., kg, l, pcs"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="quantity">{t("listings.quantity")}</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="Available quantity"
                />
              </div>
              <div>
                <Label htmlFor="location">{t("listings.location")}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                  }
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t("listings.city")}*</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      })
                    }
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">{t("listings.country")}*</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        country: e.target.value,
                      })
                    }
                    placeholder="Country"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {t("listings.create")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("listings.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("listings.filters.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">{t("listings.filters.search")}</Label>
            <Input
              id="search"
              placeholder="Search by product name..."
              value={filters.searchText}
              onChange={(e) =>
                setFilters({ ...filters, searchText: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterCity">{t("listings.filters.city")}</Label>
              <Input
                id="filterCity"
                placeholder="City"
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="filterCountry">
                {t("listings.filters.country")}
              </Label>
              <Input
                id="filterCountry"
                placeholder="Country"
                value={filters.country}
                onChange={(e) =>
                  setFilters({ ...filters, country: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="filterCategory">
                {t("listings.filters.category")}
              </Label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value === "all" ? "" : value })
                }
              >
                <SelectTrigger id="filterCategory">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortBy">{t("listings.filters.sortBy")}</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    sortBy: value as "name" | "price" | "date" | "category",
                  })
                }
              >
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  ...filters,
                  sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                })
              }
            >
              {filters.sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
            >
              {t("listings.filters.reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("listings.sales.empty")}
          </div>
        ) : (
          listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {listing.productName}
                      </h3>
                      <Badge>{listing.companyName}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {listing.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {listing.price} {listing.currency}/{listing.unit}
                        </span>
                      </div>
                      {listing.quantity && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Available: {listing.quantity} {listing.unit}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        <span>
                          {listing.city}, {listing.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/listings/${listing.id}`)}
                    className="shrink-0"
                  >
                    <MessageSquare className="mr-2 size-4" />
                    {t("listings.contact")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
