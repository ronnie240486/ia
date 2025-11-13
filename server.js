// --- IMPORTS E CONFIGURAÇÃO ---
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// --- MIDDLEWARES ---
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// --- ROTA PRINCIPAL (STATUS) ---
app.get("/", (req, res) => {
  res.json({
    status: "✅ Servidor ativo!",
    message: "Use POST /generate-image para gerar imagens.",
    endpoints: ["/generate-image"],
  });
});

// --- ROTA DE GERAÇÃO DE IMAGENS (POLLINATIONS.AI) ---
app.post("/generate-image", async (req, res) => {
  const { prompt, quantidade = 1, width = 512, height = 512 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "O prompt é obrigatório." });
  }

  const gerarImagem = async (seed) => {
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?seed=${seed}&width=${width}&height=${height}`;
    return { imageUrl, seed };
  };

  try {
    const total = Math.min(quantidade, 10); // máximo de 10 por requisição
    const seeds = Array.from({ length: total }, () =>
      Math.floor(Math.random() * 1000000)
    );
    const imagens = [];

    // processamento em lotes (evita sobrecarga)
    const loteSize = 3;
    for (let i = 0; i < seeds.length; i += loteSize) {
      const lote = seeds.slice(i, i + loteSize);
      const resultados = await Promise.allSettled(lote.map(gerarImagem));
      resultados.forEach((r) => {
        if (r.status === "fulfilled") imagens.push(r.value);
      });
      await new Promise((r) => setTimeout(r, 400)); // delay entre os lotes
    }

    console.log(`[BACKEND] Geradas ${imagens.length} imagens de: "${prompt}"`);
    res.json({ images: imagens });
  } catch (error) {
    console.error("Erro ao gerar imagens:", error);
    res.status(500).json({ error: "Erro ao gerar imagens." });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
