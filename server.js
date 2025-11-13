// --- CONFIGURAÇÃO E IMPORTS ---
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 sua chave deve estar em variável de ambiente
const DEAPI_TOKEN = process.env.DEAPI_TOKEN;

if (!DEAPI_TOKEN) {
  console.error('⚠️ ERRO: A variável DEAPI_TOKEN não está configurada no Railway.');
}

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

  // Função para gerar uma imagem via deAPI
  const gerarImagem = async (seed) => {
    try {
      const response = await fetch("https://api.deapi.ai/api/v1/client/api/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${DEAPI_TOKEN}`
        },
        body: JSON.stringify({
          prompt,
          model: "Flux1schnell", // ou outro modelo suportado
          steps: "4",
          width,
          height,
          seed
        })
      });

      if (!response.ok) {
        throw new Error(`Erro da deAPI: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Ajuste conforme formato real da resposta da deAPI
      if (!data.image_url && !data.url && !data.output) {
        console.error("Resposta inesperada:", data);
        throw new Error("A resposta da deAPI não contém um URL de imagem válido.");
      }

      const imageUrl = data.image_url || data.url || data.output;
      console.log(`[BACKEND] Imagem gerada: ${imageUrl}`);
      return { imageUrl, seed };

    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      throw err;
    }
  };

  try {
    const total = Math.min(Number(quantidade), 5); // evitar sobrecarga
    const seeds = Array.from({ length: total }, () => Math.floor(Math.random() * 1000000));
    const imagens = [];

    for (const seed of seeds) {
      const img = await gerarImagem(seed);
      imag
