// --- CONFIGURAÇÃO E IMPORTS ---
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Coloque aqui sua API KEY do deAPI.ai
const DEAPI_KEY = process.env.DEAPI_KEY || 'COLOQUE_SUA_CHAVE_AQUI';
const DEAPI_URL = 'https://api.deapi.ai/v1/image';

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

  // Função auxiliar que chama a deAPI.ai
  const gerarImagem = async (seed) => {
    try {
      const response = await fetch(DEAPI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEAPI_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          width,
          height,
          seed,
          model: 'flux-schnell', // Modelo padrão, pode trocar
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Erro deAPI:', response.status, text);
        return null;
      }

      const data = await response.json();

      // Alguns endpoints retornam { image: "base64" } ou { url: "https://..." }
      const imageUrl = data.url || data.image || null;

      return imageUrl ? { imageUrl, seed } : null;
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      return null;
    }
  };

  try {
    const total = Math.min(quantidade, 10);
    const seeds = Array.from({ length: total }, () => Math.floor(Math.random() * 1000000));
    const imagens = [];

    // Processa em pequenos lotes
    const loteSize = 3;
    for (let i = 0; i < seeds.length; i += loteSize) {
      const lote = seeds.slice(i, i + loteSize);
      const resultados = await Promise.allSettled(lote.map(gerarImagem));
      resultados.forEach(r => {
        if (r.status === 'fulfilled' && r.value) imagens.push(r.value);
      });
      await new Promise(r => setTimeout(r, 400));
    }

    if (imagens.length === 0) {
      return res.status(500).json({ error: 'A deAPI.ai não retornou nenhuma imagem válida.' });
    }

    res.json({ images: imagens });
  } catch (error) {
    console.error('Erro geral:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// --- INICIALIZA SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor deAPI rodando na porta ${PORT}`);
});
