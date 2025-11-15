import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8080;

// -----------------------------
// 1) POLLINATIONS (GRÁTIS ILIMITADO)
// -----------------------------
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// -----------------------------
// 2) HUGGINGFACE FLUX (FREE PUBLIC ENDPOINT)
// -----------------------------
async function huggingfaceFlux(prompt) {
    const response = await fetch(
        "https://hf.space/embed/black-forest-labs/FLUX.1-schnell/+/api/predict/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [prompt]
            })
        }
    );

    const json = await response.json();
    try {
        return json.data[0].url;
    } catch {
        throw new Error("Flux HF sem resposta.");
    }
}

// -----------------------------
// 3) STABLE DIFFUSION GRÁTIS VIA PROXY
// -----------------------------
async function sdProxy(prompt) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                // sem api key → usa quota pública gratuita
            },
            body: JSON.stringify({ inputs: prompt })
        }
    );

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return `data:image/png;base64,${base64}`;
}

// -----------------------------
// 4) FALLBACK UNIVERSAL (SE NADA DER CERTO)
// -----------------------------
function fallback(prompt) {
    return pollinations(prompt);
}

// -----------------------------
// ENDPOINT PRINCIPAL
// -----------------------------
app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "prompt é obrigatório" });
    }

    // Tentativa 1 → Pollinations direto (rápida)
    try {
        return res.json({
            provider: "pollinations",
            imageUrl: pollinations(prompt)
        });
    } catch {}

    // Tentativa 2 → FLUX (HuggingFace)
    try {
        const url = await huggingfaceFlux(prompt);
        return res.json({
            provider: "huggingface-flux",
            imageUrl: url
        });
    } catch {}

    // Tentativa 3 → Stable Diffusion (HF Proxy)
    try {
        const url = await sdProxy(prompt);
        return res.json({
            provider: "stable-diffusion-proxy",
            imageUrl: url
        });
    } catch {}

    // Tentativa 4 → fallback universal
    return res.json({
        provider: "fallback",
        imageUrl: fallback(prompt)
    });
});

// -----------------------------
// ROTA DE STATUS
// -----------------------------
app.get("/", (req, res) => {
    res.send("🔥 Backend de imagens grátis funcionando!");
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor online na porta ${PORT}`);
});
