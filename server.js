// --- CONFIGURAÇÃO E IMPORTS ---
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// --- ENDPOINT PRINCIPAL ---
app.post('/generate-image', async (req, res) => {
  const { prompt, width = 512, height = 512, seed } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório.' });
  }

  // Gerar uma semente aleatória para variar as imagens
  const finalSeed = seed || Math.floor(Math.random() * 1000000);

  try {
    // Novo formato da Pollinations — imagem via URL direta
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${finalSeed}&width=${width}&height=${height}`;

    console.log(`[BACKEND] Imagem gerada (Seed: ${finalSeed}): ${prompt}`);

    // Retorna o link direto da imagem
    res.json({ imageUrl, seed: finalSeed });
  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: `Erro ao gerar imagem: ${error.message}` });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor de ponte (Endpoint /generate-image) rodando na porta ${PORT}`);
});
