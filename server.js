import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ===================== CORS FULL =====================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "apikey"],
  })
);

app.options("*", cors());

app.use(express.json());

// ===================== CONFIG =====================
const PORT = process.env.PORT || 8080;
const POLLINATIONS_BACKEND_URL = "https://image.pollinations.ai/prompt/";
const DEAPI_BACKEND_URL =
  process.env.DEAPI_BACKEND_URL ||
  "https://api.deapi.ai/api/v1/client/txt2img";
const DEAPI_API_KEY = process.env.DEAPI_API_KEY;

// Cache simples
const cache = new Map();

// ===================== POLLINATIONS =====================
function gerarImagemPollinations(prompt) {
  const cacheKey = `pollinations:${prompt}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url = `${POLLINATIONS_BACKEND_URL}${encodeURIComponent(prompt)}`;
  cache.set(cacheKey, url);
  return url;
}

// ===================== DEAPI (4 formas de autenticação) =====================

async function tentarDEAPI(prompt, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(DEAPI_BACKEND_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        negative_prompt: "",
        width: 1024,
        height: 1024,
        steps: 25,
        cfg_scale: 7,
        sampler: "Euler a",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`DEAPI retornou ${response.status}: ${txt}`);
    }

    const data = await response.json();
    const url = data.image_url || data.url || (data.output && data.output[0]);
    if (!url) throw new Error("Resposta inválida da DEAPI");

    return url;
  } finally {
    clearTimeout(timeout);
  }
}

async function gerarImagemDeAPI(prompt) {
  if (!DEAPI_API_KEY) throw new Error("DEAPI_API_KEY não configurada.");

  const cacheKey = `deapi:${prompt}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const tentativas = [
    // Tentativa 1 — Bearer (mais comum)
    {
      nome: "Authorization: Bearer",
      header: { Authorization: `Bearer ${DEAPI_API_KEY}`, "Content-Type": "application/json", Accept: "application/json" }
    },
    // Tentativa 2 — Authorization simples
    {
      nome: "Authorization simples",
      header: { Authorization: DEAPI_API_KEY, "Content-Type": "application/json", Accept: "application/json" }
    },
    // Tentativa 3 — x-api-key
    {
      nome: "x-api-key",
      header: { "x-api-key": DEAPI_API_KEY, "Content-Type": "application/json", Accept: "application/json" }
    },
    // Tentativa 4 — apikey
    {
      nome: "apikey",
      header: { apikey: DEAPI_API_KEY, "Content-Type": "application/json", Accept: "application/json" }
    }
  ];

  for (const t of tentativas) {
    try {
      console.log(`[DEAPI] Testando método: ${t.nome}`);
      const url = await tentarDEAPI(prompt, t.header);
      console.log(`[DEAPI] Sucesso com método: ${t.nome}`);
      cache.set(cacheKey, url);
      return url;
    } catch (e) {
      console.log(`[DEAPI] Falhou com ${t.nome}: ${e.message}`);
    }
  }

  throw new Error("Nenhum método de autenticação funcionou.");
}

// ===================== ENDPOINT =====================
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res
      .status(400)
      .json({ error: "O campo 'prompt' é obrigatório." });
  }

  try {
    let imageUrl;

    if (model === "deapi") {
      try {
        imageUrl = await gerarImagemDeAPI(prompt);
      } catch (err) {
        console.log("[DEAPI] Todas tentativas falharam, usando Pollinations.");
        imageUrl = gerarImagemPollinations(prompt);
      }
    } else {
      imageUrl = gerarImagemPollinations(prompt);
    }

    res.json({ success: true, imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== ROTA TESTE =====================
app.get("/", (req, res) => {
  res.send("Backend online 🚀");
});

// ===================== START =====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`DEAPI_API_KEY: ${DEAPI_API_KEY ? "OK" : "MISSING"}`);
});
