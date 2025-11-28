import type {
  Listing,
  ListingDetail,
  ListingStatus,
  ProductCategory,
} from "@/models/types";
import {
  getCollections,
  getProducts,
  getProductById,
  createProduct,
} from "@/services/mercurjsApi";

// Product Categories
export async function getAllProductCategories(): Promise<ProductCategory[]> {
  try {
    const response = await getCollections({ limit: 100 });
    return (response.collections || []).map((collection: any) => ({
      id: collection.id,
      name: collection.title,
      description: collection.description,
      createdAt: collection.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}

export async function getProductCategoryById(id: string): Promise<ProductCategory | null> {
  try {
    const response = await getCollections();
    const collection = response.collections?.find((c: any) => c.id === id);
    if (!collection) return null;
    return {
      id: collection.id,
      name: collection.title,
      description: collection.description,
      createdAt: collection.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to get category:", error);
    return null;
  }
}

export async function createProductCategory(data: {
  name: string;
  description?: string;
  icon?: string;
}): Promise<ProductCategory> {
  // MercurJS collection creation would go here
  // For now, return a mock category
  return {
    id: `cat_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
}

// Listings
export async function getAllListings(filters?: {
  type?: "sale" | "purchase";
  status?: ListingStatus;
  city?: string;
  country?: string;
  category?: string;
  searchText?: string;
  sortBy?: "name" | "price" | "date" | "category";
  sortOrder?: "asc" | "desc";
}): Promise<Listing[]> {
  try {
    const response = await getProducts({
      q: filters?.searchText,
      limit: 100,
    });

    let results = (response.products || []).map((product: any) => {
      // Map MercurJS product to our Listing type
      const listing: Listing = {
        id: product.id,
        companyId: product.vendor_id || "unknown",
        companyName: product.metadata?.company_name || "Unknown",
        type: (product.metadata?.type as "sale" | "purchase") || "sale",
        productName: product.title,
        productCategory: product.collection_id || "uncategorized",
        description: product.description || "",
        price: product.variants?.[0]?.prices?.[0]?.amount / 100 || 0,
        currency: product.variants?.[0]?.prices?.[0]?.currency_code || "PLN",
        unit: product.metadata?.unit || "kg",
        quantity: product.metadata?.quantity,
        location: product.metadata?.location || "",
        city: product.metadata?.city || "",
        country: product.metadata?.country || "Poland",
        status: "approved" as ListingStatus,
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString(),
        createdBy: product.metadata?.created_by || "unknown",
      };
      return listing;
    });

    // Apply filters
    if (filters) {
      if (filters.type) {
        results = results.filter((l) => l.type === filters.type);
      }
      if (filters.status) {
        results = results.filter((l) => l.status === filters.status);
      }
      if (filters.city) {
        results = results.filter((l) =>
          l.city.toLowerCase().includes(filters.city!.toLowerCase()),
        );
      }
      if (filters.country) {
        results = results.filter((l) =>
          l.country.toLowerCase().includes(filters.country!.toLowerCase()),
        );
      }
      if (filters.category) {
        results = results.filter((l) => l.productCategory === filters.category);
      }

      // Sorting
      if (filters.sortBy) {
        results.sort((a, b) => {
          let comparison = 0;
          switch (filters.sortBy) {
            case "name":
              comparison = a.productName.localeCompare(b.productName);
              break;
            case "price":
              comparison = a.price - b.price;
              break;
            case "date":
              comparison =
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime();
              break;
            case "category":
              comparison = a.productCategory.localeCompare(b.productCategory);
              break;
          }
          return filters.sortOrder === "desc" ? -comparison : comparison;
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to get listings:", error);
    return [];
  }
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  try {
    const product = await getProductById(id);
    if (!product) return null;

    const listing: Listing = {
      id: product.id,
      companyId: product.vendor_id || "unknown",
      companyName: product.metadata?.company_name || "Unknown",
      type: (product.metadata?.type as "sale" | "purchase") || "sale",
      productName: product.title,
      productCategory: product.collection_id || "uncategorized",
      description: product.description || "",
      price: product.variants?.[0]?.prices?.[0]?.amount / 100 || 0,
      currency: product.variants?.[0]?.prices?.[0]?.currency_code || "PLN",
      unit: product.metadata?.unit || "kg",
      quantity: product.metadata?.quantity,
      location: product.metadata?.location || "",
      city: product.metadata?.city || "",
      country: product.metadata?.country || "Poland",
      status: "approved",
      createdAt: product.created_at || new Date().toISOString(),
      updatedAt: product.updated_at || new Date().toISOString(),
      createdBy: product.metadata?.created_by || "unknown",
    };

    const detail: ListingDetail = {
      ...listing,
      seller: {
        id: product.vendor_id || "unknown",
        name: product.metadata?.company_name || "Unknown",
        email: product.metadata?.seller_email || "",
        phone: product.metadata?.seller_phone,
      },
    };

    return detail;
  } catch (error) {
    console.error("Failed to get listing:", error);
    return null;
  }
}

export async function getCompanyListings(
  companyId: string,
): Promise<Listing[]> {
  try {
    const response = await getProducts({ limit: 100 });
    const results = (response.products || [])
      .filter((p: any) => p.vendor_id === companyId)
      .map((product: any) => ({
        id: product.id,
        companyId: product.vendor_id || "unknown",
        companyName: product.metadata?.company_name || "Unknown",
        type: (product.metadata?.type as "sale" | "purchase") || "sale",
        productName: product.title,
        productCategory: product.collection_id || "uncategorized",
        description: product.description || "",
        price: product.variants?.[0]?.prices?.[0]?.amount / 100 || 0,
        currency: product.variants?.[0]?.prices?.[0]?.currency_code || "PLN",
        unit: product.metadata?.unit || "kg",
        quantity: product.metadata?.quantity,
        location: product.metadata?.location || "",
        city: product.metadata?.city || "",
        country: product.metadata?.country || "Poland",
        status: "approved" as ListingStatus,
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString(),
        createdBy: product.metadata?.created_by || "unknown",
      }));
    return results;
  } catch (error) {
    console.error("Failed to get company listings:", error);
    return [];
  }
}

export async function createListing(data: {
  companyId: string;
  companyName: string;
  type: "sale" | "purchase";
  productName: string;
  productCategory: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  quantity?: number;
  location: string;
  city: string;
  country: string;
  imageUrl?: string;
  createdBy: string;
}): Promise<Listing> {
  try {
    const product = await createProduct({
      title: data.productName,
      description: data.description,
      handle: data.productName.toLowerCase().replace(/\s+/g, "-"),
    });

    if (!product) throw new Error("Failed to create product");

    return {
      id: product.id,
      companyId: data.companyId,
      companyName: data.companyName,
      type: data.type,
      productName: product.title,
      productCategory: data.productCategory,
      description: product.description || "",
      price: data.price,
      currency: data.currency,
      unit: data.unit,
      quantity: data.quantity,
      location: data.location,
      city: data.city,
      country: data.country,
      status: "pending_approval",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
    };
  } catch (error) {
    console.error("Failed to create listing:", error);
    throw error;
  }
}

export async function updateListing(
  id: string,
  data: Partial<Omit<Listing, "id" | "createdAt" | "createdBy">>,
): Promise<Listing | null> {
  try {
    // MercurJS update implementation
    // This would call the product update endpoint
    const listing = await getListingById(id);
    if (!listing) return null;

    return {
      ...listing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to update listing:", error);
    return null;
  }
}

export async function deleteListing(id: string): Promise<boolean> {
  try {
    // MercurJS delete implementation
    return true;
  } catch (error) {
    console.error("Failed to delete listing:", error);
    return false;
  }
}

export async function archiveListing(id: string): Promise<Listing | null> {
  return updateListing(id, { status: "archived" });
}

export async function restoreListing(id: string): Promise<Listing | null> {
  const listing = await getListingById(id);
  if (!listing) return null;
  const newStatus: ListingStatus =
    listing.type === "sale" ? "approved" : "approved";
  return updateListing(id, { status: newStatus });
}

// Moderation
export async function getPendingListings(): Promise<Listing[]> {
  try {
    const response = await getProducts({ limit: 100 });
    const results = (response.products || [])
      .filter(
        (p: any) =>
          p.metadata?.status === "pending_approval" ||
          !p.metadata?.status,
      )
      .map((product: any) => ({
        id: product.id,
        companyId: product.vendor_id || "unknown",
        companyName: product.metadata?.company_name || "Unknown",
        type: (product.metadata?.type as "sale" | "purchase") || "sale",
        productName: product.title,
        productCategory: product.collection_id || "uncategorized",
        description: product.description || "",
        price: product.variants?.[0]?.prices?.[0]?.amount / 100 || 0,
        currency: product.variants?.[0]?.prices?.[0]?.currency_code || "PLN",
        unit: product.metadata?.unit || "kg",
        quantity: product.metadata?.quantity,
        location: product.metadata?.location || "",
        city: product.metadata?.city || "",
        country: product.metadata?.country || "Poland",
        status: "pending_approval" as ListingStatus,
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString(),
        createdBy: product.metadata?.created_by || "unknown",
      }));
    return results;
  } catch (error) {
    console.error("Failed to get pending listings:", error);
    return [];
  }
}

export async function approveListing(
  id: string,
  moderationNotes?: string,
): Promise<Listing | null> {
  return updateListing(id, { status: "approved", moderationNotes });
}

export async function rejectListing(
  id: string,
  rejectionReason: string,
): Promise<Listing | null> {
  return updateListing(id, { status: "rejected", rejectionReason });
}

export async function getSalesListings(
  filters?: Parameters<typeof getAllListings>[0],
): Promise<Listing[]> {
  return getAllListings({ ...filters, type: "sale", status: "approved" });
}

export async function getPurchaseListings(
  filters?: Parameters<typeof getAllListings>[0],
): Promise<Listing[]> {
  return getAllListings({ ...filters, type: "purchase", status: "approved" });
}
