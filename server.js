import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8080;

// ==== Pollinations NOVO ====
const POLLINATIONS_URL = "https://pollinations.ai/p/";

// ==== DEAPI NOVO ====
const DEAPI_URL = "https://api.deapi.ai/api/v1/images/text-to-image";
const DEAPI_API_KEY = process.env.DEAPI_API_KEY;

// Cache simples
const cache = new Map();

// ======== Pollinations ===========
function gerarImagemPollinations(prompt) {
    const url = `${POLLINATIONS_URL}${encodeURIComponent(prompt)}`;
    return url;
}

// ======== DEAPI CORRIGIDO ===========
async function gerarImagemDeAPI(prompt) {

    if (!DEAPI_API_KEY) {
        throw new Error("DEAPI_API_KEY não configurada no backend.");
    }

    const response = await fetch(DEAPI_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DEAPI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            width: 1024,
            height: 1024,
            quality: "high",
            response_format: "url"  // <<< importantíssimo
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`DEAPI retornou ${response.status}: ${err}`);
    }

    const data = await response.json();

    // novo formato corretíssimo
    if (!data.output || !data.output[0]) {
        throw new Error("DEAPI não devolveu URL da imagem.");
    }

    return data.output[0];
}

// ======== ENDPOINT PRINCIPAL ===========
app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt é obrigatório." });
    }

    try {
        let imageUrl;

        if (model === "deapi") {
            try {
                imageUrl = await gerarImagemDeAPI(prompt);
            } catch (err) {
                console.error("Erro DEAPI → fallback para Pollinations:", err.message);
                imageUrl = gerarImagemPollinations(prompt);
            }
        } else if (model === "pollinations") {
            imageUrl = gerarImagemPollinations(prompt);
        } else {
            return res.status(400).json({ error: `Modelo inválido: ${model}` });
        }

        res.json({ success: true, imageUrl });

    } catch (err) {
        console.error("Erro geral:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("DEAPI_KEY:", DEAPI_API_KEY ? "OK" : "MISSING");
});

