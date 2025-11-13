// --- IMPORTS E CONFIGURAÇÃO ---
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 8080;

// --- CONFIGURAÇÃO DAS APIS ---
const DEAPI_BACKEND_URL =
  process.env.DEAPI_BACKEND_URL || "https://api.deapi.ai/v1/images/generations";
const DEAPI_API_KEY = process.env.DEAPI_API_KEY || "";

const POLLINATIONS_URL = "https://pollinations.ai/prompt/";

// --- MIDDLEWARES ---
app.use(
  cors({
    origin: "*",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// --- FUNÇÃO PRINCIPAL DE GERAÇÃO ---
const gerarImagem = async (prompt, seed, width = 512, height = 512) => {
  // 1️⃣ Tenta via DEAPI
  try {
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
      const err = await response.text();
      console.warn(`[DEAPI] Falha ${response.status}: ${err}`);
      throw new Error("DEAPI falhou");
    }

    const data = await response.json();
    if (data?.data?.[0]?.url) {
      return { imageUrl: data.data[0].url, fonte: "deapi.ai", seed };
    }

    throw new Error("Resposta inválida da DEAPI.");
  } catch (error) {
    console.warn("⚠️ Tentando Pollinations como fallback...");
  }

  // 2️⃣ Fallback via POLLINATIONS
  try {
    // Pollinations gera imagem diretamente via URL
    const imageUrl = `${POLLINATIONS_URL}${encodeURIComponent(
      prompt
    )}?seed=${seed}&width=${width}&height=${height}`;

    // Verifica se está acessível
    const check = await fetch(imageUrl, { method: "HEAD" });
    if (check.ok) {
      return { imageUrl, fonte: "pollinations.ai", seed };
    } else {
      throw new Error("Pollinations não retornou imagem válida.");
    }
  } catch (error) {
    console.error("❌ Erro total ao gerar imagem:", error);
    throw error;
  }
};

// --- ENDPOINT ---
app.post("/generate-image", async (req, res) => {
  const { prompt, quantidade = 1, width = 512, height = 512 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O prompt é obrigatório." });
  }

  const seeds = Array.from({ length: Math.min(quantidade, 10) }, () =>
    Math.floor(Math.random() * 1000000)
  );

  try {
    const resultados = await Promise.allSettled(
      seeds.map((s) => gerarImagem(prompt, s, width, height))
    );

    const imagens = resultados
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    if (imagens.length === 0) {
      return res.status(500).json({ error: "Nenhuma imagem pôde ser gerada." });
    }

    res.json({ images: imagens });
  } catch (error) {
    console.error("Erro geral:", error);
    res.status(500).json({ error: "Erro interno ao gerar imagens." });
  }
});

// --- INICIALIZA ---
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🧠 Usando endpoint DEAPI: ${DEAPI_BACKEND_URL}`);
  console.log("🪄 Fallback automático: Pollinations.ai habilitado");
});
