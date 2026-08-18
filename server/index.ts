import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { resolveStreamsServerSide } from "../shared/ytProxy.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("/api/yt/streams/:videoId", async (req, res) => {
    try {
      const info = await resolveStreamsServerSide(req.params.videoId);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(info);
    } catch (e) {
      res.status(502).json({ error: e instanceof Error ? e.message : "falha" });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
