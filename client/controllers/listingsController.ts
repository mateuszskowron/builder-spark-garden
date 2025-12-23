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

// Default product categories (fallback when backend returns empty)
export const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "vegetables", name: "Warzywa", description: "Świeże warzywa", createdAt: new Date().toISOString() },
  { id: "fruits", name: "Owoce", description: "Świeże owoce", createdAt: new Date().toISOString() },
  { id: "grains", name: "Zboża", description: "Zboża i produkty zbożowe", createdAt: new Date().toISOString() },
  { id: "dairy", name: "Nabiał", description: "Produkty mleczne", createdAt: new Date().toISOString() },
  { id: "meat", name: "Mięso", description: "Mięso i wędliny", createdAt: new Date().toISOString() },
  { id: "poultry", name: "Drób", description: "Kurczaki, indyki i inne", createdAt: new Date().toISOString() },
  { id: "eggs", name: "Jaja", description: "Jaja kurze i inne", createdAt: new Date().toISOString() },
  { id: "honey", name: "Miód", description: "Miód i produkty pszczele", createdAt: new Date().toISOString() },
  { id: "herbs", name: "Zioła", description: "Świeże i suszone zioła", createdAt: new Date().toISOString() },
  { id: "preserves", name: "Przetwory", description: "Dżemy, konfitury, kiszonki", createdAt: new Date().toISOString() },
  { id: "oils", name: "Oleje", description: "Oleje roślinne", createdAt: new Date().toISOString() },
  { id: "nuts", name: "Orzechy", description: "Orzechy i nasiona", createdAt: new Date().toISOString() },
  { id: "organic", name: "Bio/Eko", description: "Produkty ekologiczne", createdAt: new Date().toISOString() },
  { id: "other", name: "Inne", description: "Inne produkty rolne", createdAt: new Date().toISOString() },
];

// ============ DEMO MODE FUNCTIONS ============
// Local storage key for demo listings
const DEMO_LISTINGS_KEY = "app:demo-listings";

// Get demo listings from localStorage
function getDemoListings(): Listing[] {
  try {
    const stored = localStorage.getItem(DEMO_LISTINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save demo listings to localStorage
function saveDemoListings(listings: Listing[]) {
  localStorage.setItem(DEMO_LISTINGS_KEY, JSON.stringify(listings));
}

// Check if running in demo mode
function isDemoMode(): boolean {
  return localStorage.getItem("app:demo-mode") === "true";
}
// ============================================

// Helper to get category name synchronously (for display purposes)
export function getCategoryNameById(id: string): string {
  const category = DEFAULT_CATEGORIES.find((c) => c.id === id);
  return category?.name || id;
}

// Product Categories - always returns default categories (backend-independent)
export async function getAllProductCategories(): Promise<ProductCategory[]> {
  // Always return default categories to ensure the app works without backend
  // This provides a reliable, instant response for category selection
  return DEFAULT_CATEGORIES;
}

// Alternative function that tries backend first (for future use when backend is ready)
export async function getAllProductCategoriesFromBackend(): Promise<ProductCategory[]> {
  try {
    const response = await getCollections({ limit: 100 });
    const backendCategories = (response.collections || []).map((collection: any) => ({
      id: collection.id,
      name: collection.title,
      description: collection.description,
      createdAt: collection.created_at || new Date().toISOString(),
    }));

    // Return backend categories if available, otherwise use defaults
    if (backendCategories.length > 0) {
      return backendCategories;
    }

    console.log("[Categories] Using default categories (backend returned empty)");
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Failed to get categories from backend, using defaults:", error);
    return DEFAULT_CATEGORIES;
  }
}

export async function getProductCategoryById(
  id: string,
): Promise<ProductCategory | null> {
  // Use default categories for reliable operation
  const category = DEFAULT_CATEGORIES.find((c) => c.id === id);
  return category || null;
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

// Apply filters and sorting to listings
function applyFiltersAndSort(listings: Listing[], filters?: {
  type?: "sale" | "purchase";
  status?: ListingStatus;
  city?: string;
  country?: string;
  category?: string;
  searchText?: string;
  sortBy?: "name" | "price" | "date" | "category";
  sortOrder?: "asc" | "desc";
}): Listing[] {
  let results = [...listings];

  if (filters) {
    if (filters.type) {
      results = results.filter((l) => l.type === filters.type);
    }
    if (filters.status) {
      results = results.filter((l) => l.status === filters.status);
    }
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      results = results.filter((l) =>
        l.productName.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search)
      );
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
  // Always include demo listings from localStorage
  const demoListings = getDemoListings();

  if (isDemoMode()) {
    // Demo mode - only use local listings
    console.log("[Demo] Returning local listings:", demoListings.length);
    return applyFiltersAndSort(demoListings, filters);
  }

  // Real mode - try to get from API and merge with demo listings
  try {
    const response = await getProducts({
      q: filters?.searchText,
      limit: 100,
    });

    const apiListings = (response.products || []).map((product: any) => {
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

    // Merge API listings with demo listings
    const allListings = [...apiListings, ...demoListings];
    return applyFiltersAndSort(allListings, filters);
  } catch (error) {
    console.error("Failed to get listings from API, using demo listings:", error);
    // Fallback to demo listings only
    return applyFiltersAndSort(demoListings, filters);
  }
}

export async function getListingById(
  id: string,
): Promise<ListingDetail | null> {
  // Check demo listings first
  const demoListings = getDemoListings();
  const demoListing = demoListings.find(l => l.id === id);

  if (demoListing) {
    const detail: ListingDetail = {
      ...demoListing,
      seller: {
        id: demoListing.companyId,
        name: demoListing.companyName,
        email: "demo@example.com",
        phone: "+48 123 456 789",
      },
    };
    return detail;
  }

  // Try API
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
  // Get demo listings for this company
  const demoListings = getDemoListings().filter(l => l.companyId === companyId);

  if (isDemoMode()) {
    console.log("[Demo] Returning company listings:", demoListings.length);
    return demoListings;
  }

  // Try API
  try {
    const response = await getProducts({ limit: 100 });
    const apiResults = (response.products || [])
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

    // Merge with demo listings
    return [...apiResults, ...demoListings];
  } catch (error) {
    console.error("Failed to get company listings from API:", error);
    return demoListings;
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
  if (isDemoMode()) {
    // Demo mode - create listing locally
    const newListing: Listing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId: data.companyId,
      companyName: data.companyName,
      type: data.type,
      productName: data.productName,
      productCategory: data.productCategory,
      description: data.description,
      price: data.price,
      currency: data.currency,
      unit: data.unit,
      quantity: data.quantity,
      location: data.location,
      city: data.city,
      country: data.country,
      status: "approved", // Auto-approve in demo mode
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
    };

    // Save to localStorage
    const listings = getDemoListings();
    listings.push(newListing);
    saveDemoListings(listings);

    console.log("[Demo] Listing created locally:", newListing);
    return newListing;
  }

  // Real mode - try MercurJS API
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
    console.error("Failed to create listing via API:", error);
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
          p.metadata?.status === "pending_approval" || !p.metadata?.status,
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
