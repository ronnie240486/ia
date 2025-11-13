import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

// === CONFIGURAÇÕES DE ENDPOINTS ===
const POLLINATIONS_BACKEND_URL = "https://image.pollinations.ai/prompt/";
const DEAPI_BACKEND_URL = process.env.DEAPI_BACKEND_URL || "https://api.deapi.ai/api/v1/client/txt2img";
const DEAPI_API_KEY = process.env.DEAPI_API_KEY; // Defina no Railway como variável de ambiente

// === Função para gerar imagem via Pollinations ===
async function gerarImagemPollinations(prompt) {
  const url = `${POLLINATIONS_BACKEND_URL}${encodeURIComponent(prompt)}`;
  console.log(`[POLLINATIONS] Requisitando: ${url}`);
  return url; // Pollinations retorna imagem direta via GET
}

// === Função para gerar imagem via deapi.ai ===
async function gerarImagemDeAPI(prompt) {
  console.log(`[DEAPI] Chamando ${DEAPI_BACKEND_URL} com prompt: ${prompt}`);

  const response = await fetch(DEAPI_BACKEND_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DEAPI_API_KEY}`,
      "Content-Type": "application/json",
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
    console.error(`[DEAPI] erro ${response.status}: ${text}`);
    throw new Error(`DEAPI retornou ${response.status}: ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida da DEAPI: ${text}`);
  }

  // Possíveis formatos de retorno
  const imageUrl = data.image_url || data.url || data.output?.[0];
  if (!imageUrl) throw new Error(`Não foi possível localizar a URL da imagem. Resposta: ${JSON.stringify(data)}`);

  return imageUrl;
}

// === Endpoint principal ===
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O campo 'prompt' é obrigatório." });
  }

  try {
    let imageUrl;

    if (model === "pollinations") {
      imageUrl = await gerarImagemPollinations(prompt);
    } else if (model === "deapi") {
      imageUrl = await gerarImagemDeAPI(prompt);
    } else {
      return res.status(400).json({ error: "Modelo inválido ou não suportado." });
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
