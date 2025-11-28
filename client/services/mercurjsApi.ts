import Medusa from "@medusajs/js-sdk";

// Use backend proxy on same origin to avoid CORS issues
const BACKEND_URL = "https://medusa.zh.unitymsp.it";

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: false,
  auth: {
    type: "session",
  },
  publishableKey: "pk_d6a9391a6f4e32c2eb09d0031ccd8bfd5f28e14fb7c0b4db1d861ba6defd15bd"
});

// Helper to store token
export function setAuthToken(token: string) {
  localStorage.setItem("mercurjs:auth-token", token);
  // The Medusa SDK automatically handles tokens for session-based auth
  // Token is stored and retrieved automatically
}

// Helper to get token
export function getAuthToken(): string | null {
  return localStorage.getItem("mercurjs:auth-token");
}

// Helper to clear token
export function clearAuthToken() {
  localStorage.removeItem("mercurjs:auth-token");
}

// Helper to set backend URL
export function setBackendUrl(url: string) {
  localStorage.setItem("mercurjs:backend-url", url);
}

// Health check
export async function checkBackendHealth(): Promise<boolean> {
  try {
    console.log(`[MercurJS] Checking health at: ${BACKEND_URL}/health`);
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(`[MercurJS] Health check status: ${response.status}`);
    return response.ok;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[MercurJS] Health check failed: ${errorMsg}`);
    console.error("[MercurJS] Backend URL:", BACKEND_URL);
    return false;
  }
}

// Authentication API
export async function authenticateUser(email: string, password: string) {
  try {
    console.log(`[MercurJS] Authenticating with backend: ${BACKEND_URL}`);
    const result = await sdk.auth.login("user", "emailpass", {
      email,
      password,
    });

    if (typeof result === "string") {
      // Token returned
      setAuthToken(result);
      console.log("[MercurJS] Authentication successful");
      return { success: true, token: result };
    } else if (result?.location) {
      // Additional auth steps needed
      console.warn("[MercurJS] Additional authentication required");
      return { success: false, error: "Additional authentication required" };
    }

    console.error("[MercurJS] Authentication failed - unexpected response");
    return { success: false, error: "Authentication failed" };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Authentication failed";
    console.error("[MercurJS] Authentication error:", errorMsg);
    console.error("[MercurJS] Full error:", error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function getCurrentAdminUser() {
  try {
    const { user } = await sdk.admin.user.me();
    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

export async function logoutUser() {
  try {
    await sdk.auth.logout("user");
    clearAuthToken();
    return true;
  } catch {
    clearAuthToken();
    return true;
  }
}

// Products/Listings API
export async function getProducts(filters?: {
  q?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}) {
  try {
    console.log("[MercurJS] Fetching products with filters:", filters);
    const response = await sdk.store.product.list({
      q: filters?.q,
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    });
    console.log("[MercurJS] Products response:", response);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[MercurJS] Failed to get products:", errorMsg);
    console.error("[MercurJS] Full error:", error);
    return { products: [], count: 0 };
  }
}

export async function getProductById(id: string) {
  try {
    const { product } = await sdk.store.product.retrieve(id);
    return product;
  } catch (error) {
    console.error("Failed to get product:", error);
    return null;
  }
}

export async function createProduct(data: {
  title: string;
  description?: string;
  handle?: string;
  subtitle?: string;
}) {
  try {
    const { product } = await sdk.admin.product.create(data);
    return product;
  } catch (error) {
    console.error("Failed to create product:", error);
    return null;
  }
}

// Collections API (for categories)
export async function getCollections(filters?: { limit?: number; offset?: number }) {
  try {
    console.log("[MercurJS] Fetching collections with filters:", filters);
    const response = await sdk.store.collection.list({
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    });
    console.log("[MercurJS] Collections response:", response);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[MercurJS] Failed to get collections:", errorMsg);
    console.error("[MercurJS] Full error:", error);
    return { collections: [], count: 0 };
  }
}

// Orders/Transactions API
export async function getOrders(filters?: { limit?: number; offset?: number }) {
  try {
    console.log("[MercurJS] Fetching orders with filters:", filters);
    const response = await sdk.store.order.list({
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    });
    console.log("[MercurJS] Orders response:", response);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[MercurJS] Failed to get orders:", errorMsg);
    console.error("[MercurJS] Full error details:", error);
    return { orders: [], count: 0 };
  }
}

export async function getOrderById(id: string) {
  try {
    const { order } = await sdk.store.order.retrieve(id);
    return order;
  } catch (error) {
    console.error("Failed to get order:", error);
    return null;
  }
}

// Customer API
export async function getCustomer() {
  try {
    const { customer } = await sdk.store.customer.me();
    return customer;
  } catch (error) {
    console.error("Failed to get customer:", error);
    return null;
  }
}

export async function createCustomer(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}) {
  try {
    const { customer } = await sdk.store.customer.create(data);
    return customer;
  } catch (error) {
    console.error("Failed to create customer:", error);
    return null;
  }
}
