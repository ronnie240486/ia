// --- CONFIGURAÇÃO E IMPORTS ---
const express = require('express');
// const bodyParser = require('body-parser'); // Removido! Usar express.json()
const fetch = require('node-fetch'); // Necessário para a API Pollinations.ai
const cors = require('cors');

const app = express();
// O Railway/Vercel/Runway fornece a porta via process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuração de API Externa
const POLLINATIONS_URL = 'https://pollinations.ai/api/v1/generate';
const DEFAULT_MODEL = 'stable-diffusion-v1-5';

// --- MIDDLEWARES ---
app.use(cors({ 
    origin: '*', // Em produção, mude isto para o URL do seu CronoScript
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // O substituto moderno para o body-parser (CORRIGE O CRASH 404)

/**
 * Endpoint Principal: /generate-image
 * Recebe o prompt do CronoScript (frontend) e o envia para Pollinations.ai
 */
app.post('/generate-image', async (req, res) => {
    const { prompt, width = 512, height = 512, seed } = req.body;
    
    // **A CORREÇÃO PARA IMAGENS DIFERENTES**
    // Gerar uma semente aleatória se não for fornecida (para garantir imagens diferentes)
    const finalSeed = seed || Math.floor(Math.random() * 1000000);

    if (!prompt) {
        return res.status(400).json({ error: 'O prompt é obrigatório.' });
    }

    const payload = {
        prompt: prompt,
        width: width,
        height: height,
        model: DEFAULT_MODEL,
        seed: finalSeed, // <-- A SEMENTE ALEATÓRIA ESTÁ AQUI
    };

    console.log(`[BACKEND] Recebido pedido (Seed: ${finalSeed}): ${prompt.substring(0, 50)}...`);

    try {
        // 1. Chamar a API Pollinations.ai
        const apiResponse = await fetch(POLLINATIONS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            console.error(`Erro externo: ${apiResponse.status} ${apiResponse.statusText}`);
            // Retorna o erro exato para o frontend
            return res.status(apiResponse.status).json({ error: `Falha na API externa: ${apiResponse.statusText}` });
        }

        // 2. Pollinations.ai tipicamente responde com um JSON contendo o URL da imagem
        const imageResult = await apiResponse.json(); 

        if (imageResult.url) {
            // 3. Sucesso: Envia o URL para o CronoScript
            res.json({ imageUrl: imageResult.url, seed: finalSeed }); 
        } else {
            console.error('Resposta da API Pollinations inválida:', imageResult);
            res.status(500).json({ error: 'A API externa não forneceu um URL de imagem válido.' });
        }
        
    } catch (error) {
        console.error('Erro interno do servidor:', error);
        res.status(500).json({ error: `Erro interno no servidor de ponte: ${error.message}` });
    }
});

// Inicializar Servidor
app.listen(PORT, () => {
    console.log(`Servidor de ponte (Endpoint /generate-image) a correr na porta ${PORT}`);
});
