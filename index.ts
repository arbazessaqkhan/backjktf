import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { db } from "./db.js"; // ✅ adjust if db is from somewhere else
import { products } from "./shared/schema.js"; // ✅ needed for /api/health test route

const app = express();

// Enable CORS for frontend access
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fantastic-boba-6184f4.netlify.app"
  ],
  credentials: false,
}));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ✅ Debug route: check DB connection and product table
app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(products).limit(1);
    res.json({ ok: true, result });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Register all routes
(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("❌ Global Error Handler:", err);
    res.status(status).json({ error: message }); // ⛔️ Don’t rethrow!
  });

  // Serve frontend (if needed)
  // if (app.get("env") === "development") {
  //   await setupVite(app, server);
  // } else {
  //   serveStatic(app);
  // }

  // Start server on port 5000
  const port = process.env.PORT || 5000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`✅ Server running on http://localhost:${port}`);
  });
})();
