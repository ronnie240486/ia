import 'dotenv/config'; // <-- Adicionado para carregar variáveis de ambiente
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

// === CONFIGURAÇÕES ===
const POLLINATIONS_BACKEND_URL = "https://image.pollinations.ai/prompt/";
const DEAPI_BACKEND_URL =
  process.env.DEAPI_BACKEND_URL ||
  "https://api.deapi.ai/api/v1/client/txt2img";
const DEAPI_API_KEY = process.env.DEAPI_API_KEY;

// === CACHE SIMPLES EM MEMÓRIA ===
const imageCache = new Map();

// =========================================================
//   POLLINATIONS
// =========================================================
async function gerarImagemPollinations(prompt) {
  if (imageCache.has(`pollinations:${prompt}`)) {
    return imageCache.get(`pollinations:${prompt}`);
  }

  const url = `${POLLINATIONS_BACKEND_URL}${encodeURIComponent(prompt)}`;
  console.log(`[POLLINATIONS] URL: ${url}`);
  imageCache.set(`pollinations:${prompt}`, url);
  return url;
}

// =========================================================
//   DEAPI.AI
// =========================================================
async function gerarImagemDeAPI(prompt) {
  if (!DEAPI_API_KEY) {
    throw new Error("DEAPI_API_KEY não foi configurada.");
  }

  if (imageCache.has(`deapi:${prompt}`)) {
    return imageCache.get(`deapi:${prompt}`);
  }

  console.log(`[DEAPI] Chamando: ${DEAPI_BACKEND_URL}`);
  console.log(`[DEAPI] Prompt: ${prompt}`);

  // Timeout de 20s para a requisição
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch(DEAPI_BACKEND_URL, {
      method: "POST",
      headers: {
        "Authorization": DEAPI_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
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
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Requisição para DEAPI demorou muito e foi abortada.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();

  if (!response.ok) {
    console.log(`[DEAPI] ERRO ${response.status}: ${text}`);
    throw new Error(`DEAPI retornou ${response.status}: ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida da DEAPI: ${text}`);
  }

  const imageUrl =
    data.image_url ||
    data.url ||
    (data.output && data.output[0]) ||
    null;

  if (!imageUrl) {
    throw new Error(`Não foi possível obter URL da imagem. Resposta: ${JSON.stringify(data)}`);
  }

  imageCache.set(`deapi:${prompt}`, imageUrl);
  return imageUrl;
}

// =========================================================
//   ENDPOINT PRINCIPAL
// =========================================================
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O campo 'prompt' é obrigatório." });
  }

  try {
    let imageUrl;

    switch (model) {
      case "pollinations":
        imageUrl = await gerarImagemPollinations(prompt);
        break;

      case "deapi":
        imageUrl = await gerarImagemDeAPI(prompt);
        break;

      default:
        return res.status(400).json({
          error: "Modelo inválido. Use 'pollinations' ou 'deapi'.",
        });
    }

    return res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Erro ao gerar imagem:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
