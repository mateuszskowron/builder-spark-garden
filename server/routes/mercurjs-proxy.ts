import { RequestHandler } from "express";

const MERCURJS_BACKEND_URL =
  process.env.MERCURJS_BACKEND_URL || "https://medusa.zh.unitymsp.it";

export const handleMercurJsProxy: RequestHandler = async (req, res) => {
  try {
    const path = req.path.replace(/^\/api\/mercurjs/, "");
    const targetUrl = `${MERCURJS_BACKEND_URL}${path}`;

    console.log(`[Proxy] Backend URL configured: ${MERCURJS_BACKEND_URL}`);
    console.log(`[Proxy] Request path: ${req.path}`);
    console.log(`[Proxy] Stripped path: ${path}`);
    console.log(`[Proxy] Target URL: ${targetUrl}`);
    console.log(`[Proxy] Forwarding ${req.method} to ${targetUrl}`);

    const headers: Record<string, string> = {};

    // Forward relevant headers
    if (req.headers["content-type"]) {
      headers["content-type"] = req.headers["content-type"];
    }

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    // Forward cookies
    if (req.headers.cookie) {
      headers.cookie = req.headers.cookie;
    }

    const fetchOptions: any = {
      method: req.method,
      headers,
    };

    // Forward body for POST, PUT, PATCH requests
    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      req.body &&
      Object.keys(req.body).length > 0
    ) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(
      `[Proxy] Fetch options:`,
      JSON.stringify(fetchOptions, null, 2),
    );

    console.log(`[Proxy] Making fetch request to: ${targetUrl}`);
    console.log(`[Proxy] Request headers:`, headers);

    const response = await fetch(targetUrl, fetchOptions);

    console.log(`[Proxy] Response status: ${response.status}`);
    console.log(
      `[Proxy] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    // Log response size to detect empty responses
    const responseText = await response.text();
    console.log(`[Proxy] Response length: ${responseText.length} bytes`);
    console.log(`[Proxy] Response preview:`, responseText.substring(0, 500));

    // Parse response body
    const contentType = response.headers.get("content-type");
    let body: any;

    if (contentType?.includes("application/json")) {
      try {
        body = JSON.parse(responseText);
      } catch {
        body = { raw: responseText };
      }
    } else if (contentType?.includes("text")) {
      body = responseText;
    } else {
      // For binary content, assume it's already read as text and encode
      body = { data: responseText };
    }

    // Forward response headers
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    if (contentType) {
      res.setHeader("content-type", contentType);
    }

    // Allow CORS from frontend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (contentType?.includes("application/json")) {
      res.status(response.status).json(body);
    } else {
      res.status(response.status).send(body);
    }
  } catch (error) {
    console.error("[Proxy] Fatal error:", error);
    console.error(
      "[Proxy] Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error("[Proxy] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      backend_url: MERCURJS_BACKEND_URL,
    });

    res.status(500).json({
      message: "Proxy error",
      error: error instanceof Error ? error.message : "Unknown error",
      backend_url: MERCURJS_BACKEND_URL,
    });
  }
};

export const handleMercurJsProxyOptions: RequestHandler = (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
};
