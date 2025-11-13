// --- CONFIGURAÇÃO E IMPORTS ---
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 8080;

// URL do endpoint da deapi.ai
const DEAPI_BACKEND_URL = process.env.DEAPI_BACKEND_URL || "https://api.deapi.ai/v1/images/generations";

// --- MIDDLEWARES ---
app.use(cors({ origin: "*", methods: ["POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

// --- ENDPOINT PRINCIPAL ---
app.post("/generate-image", async (req, res) => {
  const { prompt, quantidade = 1, width = 512, height = 512 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O prompt é obrigatório." });
  }

  try {
    const images = [];

    for (let i = 0; i < quantidade; i++) {
      const response = await fetch(DEAPI_BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEAPI_API_KEY}`, // opcional, se tiver chave
        },
        body: JSON.stringify({
          model: "flux-1", // ou outro modelo disponível na deapi.ai
          prompt,
          size: `${width}x${height}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("[DEAPI] erro", response.status, errData);
        throw new Error(`DEAPI retornou ${response.status}`);
      }

      const data = await response.json();
      if (data?.data?.[0]?.url) {
        images.push({ imageUrl: data.data[0].url });
      } else {
        throw new Error("Resposta inesperada da DEAPI");
      }
    }

    res.json({ images });
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
