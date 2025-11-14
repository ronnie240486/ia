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

const DEAPI_API_KEY = process.env.DEAPI_API_KEY; // Defina no Railway

// =========================================================
//   POLLINATIONS
// =========================================================
async function gerarImagemPollinations(prompt) {
  const url = `${POLLINATIONS_BACKEND_URL}${encodeURIComponent(prompt)}`;
  console.log(`[POLLINATIONS] URL: ${url}`);
  return url; // A API já retorna a imagem diretamente
}

// =========================================================
//   DEAPI.AI (100% CORRIGIDO)
// =========================================================
async function gerarImagemDeAPI(prompt) {
  if (!DEAPI_API_KEY) {
    throw new Error("DEAPI_API_KEY não foi configurada no Railway.");
  }

  console.log(`[DEAPI] Chamando: ${DEAPI_BACKEND_URL}`);
  console.log(`[DEAPI] Prompt: ${prompt}`);

  const response = await fetch(DEAPI_BACKEND_URL, {
    method: "POST",
    headers: {
      "Authorization": DEAPI_API_KEY, // <-- SEM BEARER (CORRETO)
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
  });

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
    throw new Error(
      `Não foi possível obter URL da imagem. Resposta: ${JSON.stringify(data)}`
    );
  }

  return imageUrl;
}

// =========================================================
//   ENDPOINT PRINCIPAL
// =========================================================
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res
      .status(400)
      .json({ error: "O campo 'prompt' é obrigatório." });
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
