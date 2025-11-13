// server.js - backend pronto para deAPI.ai (usa DEAPI_BACKEND_URL e DEAPI_KEY)
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// LEIA A URL DO BACKEND DA DEAPI E A CHAVE AQUI (defina no Railway como variáveis de ambiente)
const DEAPI_BACKEND_URL = process.env.DEAPI_BACKEND_URL || '287|3JMRYgtTrUuaPH0skM69mbXE4Reg2DhhfWTD49LK518314a1';
const DEAPI_KEY = process.env.DEAPI_KEY || '';

if (!DEAPI_BACKEND_URL || DEAPI_BACKEND_URL === '287|3JMRYgtTrUuaPH0skM69mbXE4Reg2DhhfWTD49LK518314a1') {
  console.error('⚠️ ERRO: A variável DEAPI_BACKEND_URL não está configurada. Defina-a no Railway (Settings -> Variables).');
}
if (!DEAPI_KEY) {
  console.error('⚠️ AVISO: A variável DEAPI_KEY não está configurada. Sem chave, chamadas autenticadas vão falhar.');
}

app.use(cors({ origin: '*', methods: ['POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

app.post('/generate-image', async (req, res) => {
  const { prompt, quantidade = 1, width = 512, height = 512 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório.' });
  }

  // validação de configuração
  if (!DEAPI_BACKEND_URL || DEAPI_BACKEND_URL === 'YOUR_DEAPI_ENDPOINT_URL_HERE') {
    return res.status(500).json({
      error: 'Falha ao gerar imagem: DEAPI_BACKEND_URL não foi configurada no servidor. Configure a variável de ambiente DEAPI_BACKEND_URL.'
    });
  }
  if (!DEAPI_KEY) {
    return res.status(500).json({
      error: 'Falha ao gerar imagem: DEAPI_KEY não foi configurada no servidor. Configure a variável de ambiente DEAPI_KEY.'
    });
  }

  // função que chama a deAPI (uma chamada por seed)
  const gerarImagem = async (seed) => {
    try {
      const payload = {
        prompt,
        width,
        height,
        seed,
        // model/steps podem ser ajustados conforme doc da deAPI
        // ex: model: 'flux-schnell', steps: 20
      };

      const resp = await fetch(DEAPI_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEAPI_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error(`[DEAPI] erro ${resp.status}: ${txt}`);
        throw new Error(`DEAPI retornou ${resp.status}`);
      }

      const data = await resp.json();
      // normaliza possíveis formatos de retorno
      const imageUrl = data.url || data.image || data.image_url || (data.output && data.output[0]) || null;

      if (!imageUrl) {
        console.error('Resposta inesperada da deAPI:', data);
        throw new Error('A deAPI não retornou URL de imagem no formato esperado.');
      }

      return { imageUrl, seed };
    } catch (err) {
      console.error('Erro ao chamar deAPI:', err);
      return null; // tratamos no código chamador
    }
  };

  try {
    const total = Math.min(Number(quantidade), 10);
    const seeds = Array.from({ length: total }, () => Math.floor(Math.random() * 1000000));
    const imagens = [];

    const loteSize = 3;
    for (let i = 0; i < seeds.length; i += loteSize) {
      const lote = seeds.slice(i, i + loteSize);
      const resultados = await Promise.allSettled(lote.map(s => gerarImagem(s)));
      resultados.forEach(r => {
        if (r.status === 'fulfilled' && r.value) imagens.push(r.value);
      });
      // delay curto para não sobrecarregar
      await new Promise(r => setTimeout(r, 350));
    }

    if (imagens.length === 0) {
      return res.status(502).json({ error: 'A deAPI.ai não retornou imagens válidas. Verifique logs do servidor.' });
    }

    // compatibilidade: se 1 imagem, retorna imageUrl; se >1 retorna images
    if (imagens.length === 1) {
      return res.json({ imageUrl: imagens[0].imageUrl, seed: imagens[0].seed });
    } else {
      return res.json({ images: imagens });
    }
  } catch (err) {
    console.error('Erro interno na rota /generate-image:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar imagens.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`DEAPI_BACKEND_URL=${DEAPI_BACKEND_URL === 'YOUR_DEAPI_ENDPOINT_URL_HERE' ? '(não configurada)' : DEAPI_BACKEND_URL}`);
});
