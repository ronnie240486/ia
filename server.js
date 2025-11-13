const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🔗 Endpoints externos
const DEAPI_URL = "https://api.deapi.ai/api/v1/client/txt2img";
const POLLINATIONS_URL = "https://pollinations.ai/prompt"; // usado no modelo gratuito

// =======================
// Função: gerar imagem via DeAPI
// =======================
async function gerarImagemDeAPI(prompt) {
  try {
    const response = await fetch(DEAPI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "1:1",
        negative_prompt: "",
        model: "flux", // modelo padrão gratuito da DeAPI
      }),
    });

    if (!response.ok) {
      const erro = await response.text();
      console.error("[DEAPI] Erro:", erro);
      throw new Error(`DEAPI retornou ${response.status}`);
    }

    const data = await response.json();

    // DeAPI geralmente retorna { image_url: "https://..." }
    if (data.image_url) return data.image_url;
    else throw new Error("URL de imagem não encontrada na resposta da DeAPI.");
  } catch (err) {
    console.error("Erro ao chamar DeAPI:", err.message);
    throw err;
  }
}

// =======================
// Função: gerar imagem via Pollinations
// =======================
async function gerarImagemPollinations(prompt) {
  // A Pollinations gera imagem via URL direta
  return `${POLLINATIONS_URL}/${encodeURIComponent(prompt)}?width=512&height=512`;
}

// =======================
// Rota principal /generate-image
// =======================
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt é obrigatório." });

  try {
    let imageUrl;

    if (model === "deapi") {
      imageUrl = await gerarImagemDeAPI(prompt);
    } else {
      imageUrl = await gerarImagemPollinations(prompt);
    }

    res.json({ imageUrl });
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    res.status(500).json({ error: "Falha ao gerar imagem", details: error.message });
  }
});

// =======================
// Teste de rota raiz
// =======================
app.get("/", (req, res) => {
  res.send("✅ Servidor de ponte ativo! Use POST /generate-image");
});

// =======================
// Inicializa o servidor
// =======================
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
