import { RequestHandler } from "express";

const MERCURJS_BACKEND_URL =
  process.env.MERCURJS_BACKEND_URL || "https://medusa.zh.unitymsp.it";

export const handleMercurJsProxy: RequestHandler = async (req, res) => {
  try {
    const path = req.path.replace(/^\/api\/mercurjs/, "");
    const targetUrl = `${MERCURJS_BACKEND_URL}${path}`;

    console.log(`[Proxy] Forwarding ${req.method} ${path} to ${targetUrl}`);

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

    const response = await fetch(targetUrl, fetchOptions);

    // Get response body
    const contentType = response.headers.get("content-type");
    let body: any;

    if (contentType?.includes("application/json")) {
      body = await response.json();
    } else if (contentType?.includes("text")) {
      body = await response.text();
    } else {
      body = await response.buffer();
    }

    // Forward response headers
    if (response.headers.get("set-cookie")) {
      res.setHeader("set-cookie", response.headers.get("set-cookie"));
    }

    if (contentType) {
      res.setHeader("content-type", contentType);
    }

    // Allow CORS from frontend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    res.status(response.status).json(body);
  } catch (error) {
    console.error("[Proxy] Error:", error);
    res.status(500).json({
      message: "Proxy error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleMercurJsProxyOptions: RequestHandler = (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
};
