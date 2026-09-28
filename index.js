const express = require("express");

const app = express();
app.use(express.json({ limit: "1mb" }));

const startedAt = Date.now();
let requestCount = 0;
const users = [];
const messages = [];

app.use((req, res, next) => {
  requestCount++;
  res.setHeader("X-Powered-By", "Servidor-Interativo");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Servidor Interativo",
    version: "1.0.0",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    requests: requestCount,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    environment: process.env.VERCEL ? "Vercel" : "Local",
    runtime: "Node.js",
    platform: process.platform,
    node: process.version,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/users", (req, res) => {
  res.json({
    success: true,
    total: users.length,
    users
  });
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "name e email são obrigatórios"
    });
  }

  const user = {
    id: users.length + 1,
    name: String(name).trim(),
    email: String(email).trim(),
    createdAt: new Date().toISOString()
  };

  users.push(user);

  res.status(201).json({
    success: true,
    user
  });
});

app.get("/api/messages", (req, res) => {
  res.json({
    success: true,
    total: messages.length,
    messages
  });
});

app.post("/api/messages", (req, res) => {
  const { message } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({
      success: false,
      error: "message é obrigatório"
    });
  }

  const item = {
    id: messages.length + 1,
    message: String(message).trim(),
    createdAt: new Date().toISOString()
  };

  messages.push(item);

  res.status(201).json({
    success: true,
    message: item
  });
});

app.get("/api", (req, res) => {
  res.json({
    name: "Servidor Interativo",
    status: "online",
    endpoints: [
      "GET /api/health",
      "GET /api/status",
      "GET /api/users",
      "POST /api/users",
      "GET /api/messages",
      "POST /api/messages"
    ]
  });
});

module.exports = app;
