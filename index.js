const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json({ limit: "1mb" }));

const startedAt = Date.now();
let requestCount = 0;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

app.use((req, res, next) => {
  requestCount++;
  res.setHeader("X-Powered-By", "NEXORA-Server");
  next();
});

function requireDatabase(res) {
  if (!supabase) {
    res.status(503).json({
      success: false,
      error: "Banco de dados não configurado",
      message: "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel."
    });
    return false;
  }
  return true;
}

app.get("/api", (req, res) => {
  res.json({
    name: "NEXORA Server",
    version: "2.0.0",
    status: "online",
    database: Boolean(supabase),
    endpoints: [
      "GET /api",
      "GET /api/health",
      "GET /api/status",
      "GET /api/users",
      "POST /api/users",
      "GET /api/messages",
      "POST /api/messages"
    ]
  });
});

app.get("/api/health", async (req, res) => {
  let database = "not_configured";

  if (supabase) {
    const { error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });
    database = error ? "error" : "connected";
  }

  res.json({
    status: "online",
    service: "NEXORA Server",
    version: "2.0.0",
    database,
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
    database: Boolean(supabase),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/users", async (req, res) => {
  if (!requireDatabase(res)) return;

  const { data, error } = await supabase
    .from("users")
    .select("id,name,email,created_at")
    .order("id", { ascending: false })
    .limit(100);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, total: data.length, users: data });
});

app.post("/api/users", async (req, res) => {
  if (!requireDatabase(res)) return;

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "name e email são obrigatórios"
    });
  }

  const { data, error } = await supabase
    .from("users")
    .insert({ name, email })
    .select("id,name,email,created_at")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    return res.status(duplicate ? 409 : 500).json({
      success: false,
      error: duplicate ? "Este e-mail já está cadastrado." : error.message
    });
  }

  res.status(201).json({ success: true, user: data });
});

app.get("/api/messages", async (req, res) => {
  if (!requireDatabase(res)) return;

  const { data, error } = await supabase
    .from("messages")
    .select("id,message,created_at")
    .order("id", { ascending: false })
    .limit(100);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, total: data.length, messages: data });
});

app.post("/api/messages", async (req, res) => {
  if (!requireDatabase(res)) return;

  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "message é obrigatório"
    });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ message })
    .select("id,message,created_at")
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.status(201).json({ success: true, message: data });
});

module.exports = app;
