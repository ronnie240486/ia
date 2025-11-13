// --- CONFIGURAÇÃO E IMPORTS ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

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

  // --- Função auxiliar para gerar URL via deAPI.ai ---
  const gerarImagem = async (seed) => {
    // URL do deAPI.ai (sem necessidade de chamada assíncrona)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=${width}&height=${height}`;
    return { imageUrl, seed };
  };

  try {
    const total = Math.min(quantidade, 10); // Evita sobrecarga
    const seeds = Array.from({ length: total }, () => Math.floor(Math.random() * 1000000));
    const imagens = [];

    const loteSize = 3; // Gera em pequenos lotes
    for (let i = 0; i < seeds.length; i += loteSize) {
      const lote = seeds.slice(i, i + loteSize);
      const resultados = await Promise.allSettled(lote.map(gerarImagem));
      resultados.forEach(r => {
        if (r.status === 'fulfilled') imagens.push(r.value);
      });
      await new Promise(r => setTimeout(r, 300)); // pequeno delay
    }

    res.json({ images: imagens });
  } catch (error) {
    console.error('Erro ao gerar imagens:', error);
    res.status(500).json({ error: 'Erro ao gerar imagens.' });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
