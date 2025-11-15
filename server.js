import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ===================== CORS FULL =====================
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.json());

// ===================== CONSTANTES =====================
const PORT = process.env.PORT || 8080;
const POLLINATIONS_BACKEND_URL = "https://image.pollinations.ai/prompt/";
const DEAPI_BACKEND_URL = process.env.DEAPI_BACKEND_URL || "https://api.deapi.ai/api/v1/client/txt2img";
const DEAPI_API_KEY = process.env.DEAPI_API_KEY;

// Cache simples
const cache = new Map();

// ===================== POLLINATIONS =====================
function gerarImagemPollinations(prompt) {
    const cacheKey = `pollinations:${prompt}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const url = `${POLLINATIONS_BACKEND_URL}${encodeURIComponent(prompt)}`;
    cache.set(cacheKey, url);
    return url;
}

// ===================== DEAPI =====================
async function gerarImagemDeAPI(prompt) {
    if (!DEAPI_API_KEY) throw new Error("DEAPI_API_KEY não configurada.");

    const cacheKey = `deapi:${prompt}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response;

    try {
        response = await fetch(DEAPI_BACKEND_URL, {
            method: "POST",
            headers: {
                Authorization: DEAPI_API_KEY,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                prompt,
                negative_prompt: "",
                width: 1024,
                height: 1024,
                steps: 25,
                cfg_scale: 7,
                sampler: "Euler a",
            }),
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === "AbortError") throw new Error("DEAPI demorou e foi abortada.");
        throw err;
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`DEAPI retornou ${response.status}: ${text}`);
    }

    const data = await response.json();
    const imageUrl = data.image_url || data.url || (data.output && data.output[0]);

    if (!imageUrl) throw new Error("Não foi possível obter URL da imagem.");

    cache.set(cacheKey, imageUrl);
    return imageUrl;
}

// ===================== ENDPOINT =====================
app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "O campo 'prompt' é obrigatório." });
    }

    try {
        let imageUrl;

        if (model === "deapi") {
            try {
                imageUrl = await gerarImagemDeAPI(prompt);
            } catch (err) {
                console.error("[DEAPI] Falhou, fallback:", err.message);
                imageUrl = gerarImagemPollinations(prompt);
            }
        } else {
            imageUrl = gerarImagemPollinations(prompt);
        }

        res.json({ success: true, imageUrl });

    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        res.status(500).json({ error: err.message });
    }
});

// ===================== ROTA INICIAL =====================
app.get("/", (req, res) => {
    res.send("Backend online 🚀");
});

// ===================== START =====================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`DEAPI_API_KEY: ${DEAPI_API_KEY ? "OK" : "MISSING"}`);
});
