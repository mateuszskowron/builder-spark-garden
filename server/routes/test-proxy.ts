import { RequestHandler } from "express";

const MERCURJS_BACKEND_URL =
  process.env.MERCURJS_BACKEND_URL || "https://medusa.zh.unitymsp.it";

export const testProxyConnection: RequestHandler = async (req, res) => {
  try {
    console.log("[Test] Testing connection to:", MERCURJS_BACKEND_URL);

    // Try to fetch the root of the backend
    const response = await fetch(`${MERCURJS_BACKEND_URL}/`, {
      method: "GET",
      headers: {
        "User-Agent": "ProxyTest/1.0",
      },
    });

    console.log("[Test] Response status:", response.status);

    const contentType = response.headers.get("content-type");
    let body: any;

    if (contentType?.includes("application/json")) {
      try {
        body = await response.json();
      } catch {
        body = { raw: await response.text() };
      }
    } else {
      body = { text: await response.text() };
    }

    res.json({
      status: "success",
      backend_url: MERCURJS_BACKEND_URL,
      response_status: response.status,
      response_headers: Object.fromEntries(response.headers.entries()),
      response_body: body,
    });
  } catch (error) {
    console.error("[Test] Error:", error);
    res.status(500).json({
      status: "error",
      backend_url: MERCURJS_BACKEND_URL,
      error: error instanceof Error ? error.message : "Unknown error",
      error_type:
        error instanceof Error ? error.constructor.name : typeof error,
    });
  }
};
