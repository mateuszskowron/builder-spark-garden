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
  let results = [...listings];

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
    if (filters.searchText) {
      const text = filters.searchText.toLowerCase();
      results = results.filter(
        (l) =>
          l.productName.toLowerCase().includes(text) ||
          l.description.toLowerCase().includes(text),
      );
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
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
          case "category":
            comparison = a.productCategory.localeCompare(b.productCategory);
            break;
        }
        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }
  }

  return delay(results, 300);
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  const listing = listings.find((l) => l.id === id);
  if (!listing) return delay(null, 100);

  const detail: ListingDetail = {
    ...listing,
    seller: {
      id: listing.createdBy,
      name: listing.companyName,
      email: `contact@${listing.companyName.toLowerCase().replace(/\s+/g, "")}.pl`,
    },
  };

  return delay(detail, 150);
}

export async function getCompanyListings(companyId: string): Promise<Listing[]> {
  const results = listings.filter((l) => l.companyId === companyId);
  return delay([...results], 200);
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
  const listing: Listing = {
    id: `list${listings.length + 1}`,
    ...data,
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  listings.push(listing);
  return delay(listing, 200);
}

export async function updateListing(
  id: string,
  data: Partial<Omit<Listing, "id" | "createdAt" | "createdBy">>,
): Promise<Listing | null> {
  const index = listings.findIndex((l) => l.id === id);
  if (index === -1) return delay(null, 150);
  listings[index] = {
    ...listings[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return delay(listings[index], 150);
}

export async function deleteListing(id: string): Promise<boolean> {
  const index = listings.findIndex((l) => l.id === id);
  if (index === -1) return delay(false, 150);
  listings.splice(index, 1);
  return delay(true, 150);
}

export async function archiveListing(id: string): Promise<Listing | null> {
  return updateListing(id, { status: "archived" });
}

export async function restoreListing(id: string): Promise<Listing | null> {
  const listing = listings.find((l) => l.id === id);
  if (!listing) return delay(null, 100);
  const newStatus: ListingStatus =
    listing.type === "sale" ? "approved" : "approved";
  return updateListing(id, { status: newStatus });
}

// Moderation
export async function getPendingListings(): Promise<Listing[]> {
  const results = listings.filter((l) => l.status === "pending_approval");
  return delay([...results], 200);
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

export async function getSalesListings(filters?: Parameters<typeof getAllListings>[0]): Promise<Listing[]> {
  return getAllListings({ ...filters, type: "sale", status: "approved" });
}

export async function getPurchaseListings(filters?: Parameters<typeof getAllListings>[0]): Promise<Listing[]> {
  return getAllListings({ ...filters, type: "purchase", status: "approved" });
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
