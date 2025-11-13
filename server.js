// --- CONFIGURAÇÃO E IMPORTS ---
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 8080;

// --- CONFIGURAÇÃO DE API DE TERCEIROS ---
// Usa a variável do Railway ou o endpoint padrão da deapi.ai
const DEAPI_BACKEND_URL =
  process.env.DEAPI_BACKEND_URL || "https://api.deapi.ai/v1/images/generations";

const DEAPI_API_KEY = process.env.DEAPI_API_KEY || ""; // opcional (se precisar autenticar)

// --- MIDDLEWARES ---
app.use(
  cors({
    origin: "*",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// --- ENDPOINT PRINCIPAL ---
app.post("/generate-image", async (req, res) => {
  const { prompt, quantidade = 1, width = 512, height = 512 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O prompt é obrigatório." });
  }

  // Gera sementes aleatórias
  const seeds = Array.from({ length: Math.min(quantidade, 10) }, () =>
    Math.floor(Math.random() * 1000000)
  );

  const gerarImagem = async (seed) => {
    try {
      // Corpo da requisição conforme API da deapi.ai
      const response = await fetch(DEAPI_BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(DEAPI_API_KEY ? { Authorization: `Bearer ${DEAPI_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          size: `${width}x${height}`,
          seed,
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error("[DEAPI] erro", response.status, errData);
        throw new Error(`DEAPI retornou ${response.status}`);
      }

      const data = await response.json();

      // O retorno deve conter a URL da imagem
      if (data && data.data && data.data[0] && data.data[0].url) {
        return { imageUrl: data.data[0].url, seed };
      } else {
        throw new Error("Resposta inesperada da DEAPI.");
      }
    } catch (error) {
      console.error("Erro ao chamar deAPI:", error);
      throw error;
    }
  };

  try {
    // Processa em paralelo
    const resultados = await Promise.allSettled(seeds.map(gerarImagem));
    const imagens = resultados
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    if (imagens.length === 0) {
      return res.status(500).json({
        error: "Falha ao gerar imagens. Nenhuma resposta válida recebida da deapi.ai.",
      });
    }

    res.json({ images: imagens });
  } catch (error) {
    console.error("Erro geral:", error);
    res.status(500).json({ error: "Erro interno ao gerar imagens." });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🧠 Usando endpoint DEAPI: ${DEAPI_BACKEND_URL}`);
});
