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
  const { prompt, quantidade = 1, width = 512, height = 512 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório.' });
  }

  // Função para gerar um link de imagem
  const gerarImagem = async (seed) => {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=${width}&height=${height}`;
    console.log(`[BACKEND] Imagem gerada (Seed: ${seed}): ${prompt}`);
    return { imageUrl: url, seed };
  };

  try {
    // Limite de 10 imagens por requisição
    const total = Math.min(Number(quantidade), 10);
    const seeds = Array.from({ length: total }, () => Math.floor(Math.random() * 1000000));
    const imagens = [];

    // Gera em lotes de 3 para evitar travamentos e lentidão
    const loteSize = 3;
    for (let i = 0; i < seeds.length; i += loteSize) {
      const lote = seeds.slice(i, i + loteSize);
      const resultados = await Promise.allSettled(lote.map(gerarImagem));
      resultados.forEach(r => {
        if (r.status === 'fulfilled') imagens.push(r.value);
      });
      // Delay curto entre os lotes (ajuda a evitar erro 429 da Pollinations)
      await new Promise(r => setTimeout(r, 300));
    }

    // ✅ Compatibilidade com frontend antigo e novo
    if (imagens.length === 1) {
      return res.json({ imageUrl: imagens[0].imageUrl, seed: imagens[0].seed });
    } else {
      return res.json({ images: imagens });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: `Erro ao gerar imagem: ${error.message}` });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor de ponte (Endpoint /generate-image) rodando na porta ${PORT}`);
});
