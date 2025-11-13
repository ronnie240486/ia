// --- CONFIGURAÇÃO E IMPORTS ---

const express = require('express');

// const bodyParser = require('body-parser'); // Removido - Não é necessário

const cors = require('cors');



const app = express();

const PORT = process.env.PORT || 3000;



// Configuração de API Externa

const POLLINATIONS_URL_BASE = 'https://pollinations.ai/p/'; 

const DEFAULT_MODEL = 'stable-diffusion-v1-5';



// --- MIDDLEWARES ---

app.use(cors({ 

    origin: '*', 

    methods: ['POST'],

    allowedHeaders: ['Content-Type']

}));



// ATUALIZADO: Usando o parser nativo do Express

app.use(express.json()); 



/**

 * Endpoint Principal: / (Rota Raiz)

 * Constrói o URL do Pollinations.ai e o retorna ao CronoScript.

 */

app.post('/', (req, res) => {

    const { prompt, width = 512, height = 512 } = req.body;



    if (!prompt) {

        return res.status(400).json({ error: 'O prompt é obrigatório.' });

    }



    console.log(`[BACKEND] Recebido pedido na RAIZ (/): ${prompt.substring(0, 50)}...`);



    try {

        // 1. Codificar o prompt para ser seguro no URL

        const encodedPrompt = encodeURIComponent(prompt);

        

        // 2. Construir o URL final da imagem

        const finalUrl = `${POLLINATIONS_URL_BASE}${encodedPrompt}?width=${width}&height=${height}&model=${DEFAULT_MODEL}`;



        console.log(`[BACKEND] URL gerado: ${finalUrl.substring(0, 100)}...`);



        // 3. Sucesso: Envia o URL para o CronoScript

        res.json({ imageUrl: finalUrl }); 

        

    } catch (error) {

        console.error('Erro interno do servidor:', error);

        res.status(500).json({ error: `Erro interno no servidor de ponte: ${error.message}` });

    }

});



// Inicializar Servidor

app.listen(PORT, () => {

    console.log(`Servidor de ponte (Endpoint / (Raiz)) a correr na porta ${PORT}`);

});
