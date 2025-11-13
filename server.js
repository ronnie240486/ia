const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🔗 Endpoints externos
const DEAPI_URL = "https://api.deapi.ai/api/v1/client/txt2img";
const POLLINATIONS_URL = "https://image.pollinations.ai/prompt";

// =======================
// Função: gerar imagem via DeAPI.ai (POST)
// =======================
async function gerarImagemDeAPI(prompt) {
  try {
    const response = await fetch("https://api.deapi.ai/api/v1/client/txt2img", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEAPI_API_KEY}`, // ✅ agora com autenticação
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "1:1",
        model: "flux", // modelo gratuito ou padrão
      }),
    });

    if (!response.ok) {
      const erro = await response.text();
      console.error("[DEAPI] Erro:", erro);
      throw new Error(`DEAPI retornou ${response.status}`);
    }

    const data = await response.json();

    if (data.image_url) return data.image_url;
    else throw new Error("URL de imagem não encontrada na resposta da DeAPI.");
  } catch (err) {
    console.error("Erro ao chamar DeAPI:", err.message);
    throw err;
  }
}


// =======================
// Função: gerar imagem via Pollinations.ai (GET)
// =======================
async function gerarImagemPollinations(prompt, options = {}) {
  const { model = "flux", width = 1024, height = 1024, seed } = options;

  // Monta a URL com os parâmetros
  const params = new URLSearchParams({
    model,
    width,
    height,
  });
  if (seed) params.append("seed", seed);

  const url = `${POLLINATIONS_URL}/${encodeURIComponent(prompt)}?${params.toString()}`;
  return url; // Retorna o link direto da imagem gerada
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
