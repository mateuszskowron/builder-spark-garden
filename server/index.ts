import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleMercurJsProxy, handleMercurJsProxyOptions } from "./routes/mercurjs-proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // MercurJS Proxy routes
  app.options(/^\/api\/mercurjs($|\/)/, handleMercurJsProxyOptions);
  app.all(/^\/api\/mercurjs($|\/)/, handleMercurJsProxy);

  // Log configuration on startup
  console.log("[Server] MercurJS Proxy configured");
  console.log("[Server] MERCURJS_BACKEND_URL:", process.env.MERCURJS_BACKEND_URL || "not set (using default)");
  console.log("[Server] Proxy endpoint: /api/mercurjs");

  return app;
}
