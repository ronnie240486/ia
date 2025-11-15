import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8080;

// ------------------------------------------------------------
// MODEL 1 — POLLINATIONS (FREE, INSTANT, UNLIMITED)
// ------------------------------------------------------------
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// ------------------------------------------------------------
// MODEL 2 — FLUX (HuggingFace Public Space - FREE)
// ------------------------------------------------------------
async function flux(prompt) {
    const response = await fetch(
        "https://hf.space/embed/black-forest-labs/FLUX.1-schnell/+/api/predict/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: [prompt] })
        }
    );

    const json = await response.json();

    if (!json?.data?.[0]?.url) {
        throw new Error("Flux não retornou imagem.");
    }

    return json.data[0].url;
}

// ------------------------------------------------------------
// MODEL 3 — STABLE DIFFUSION GRÁTIS VIA PROXY HF
// ------------------------------------------------------------
async function stableDiffusion(prompt) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                // Sem chave → usa proxy público gratuito
            },
            body: JSON.stringify({ inputs: prompt })
        }
    );

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return `data:image/png;base64,${base64}`;
}

// ------------------------------------------------------------
// AUTO MODE — TENTA TODOS EM ORDEM
// ------------------------------------------------------------
async function autoMode(prompt) {
    try { return { provider: "pollinations", url: pollinations(prompt) }; }
    catch {}

    try { return { provider: "flux", url: await flux(prompt) }; }
    catch {}

    try { return { provider: "stable-diffusion", url: await stableDiffusion(prompt) }; }
    catch {}

    return { provider: "fallback", url: pollinations(prompt) };
}

// ------------------------------------------------------------
// ENDPOINT PRINCIPAL
// ------------------------------------------------------------
app.post("/generate-image", async (req, res) => {
    const { prompt, model = "auto" } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "prompt é obrigatório" });
    }

    try {
        let imageUrl, provider;

        switch (model) {
            case "pollinations":
                provider = "pollinations";
                imageUrl = pollinations(prompt);
                break;

            case "flux":
                provider = "flux";
                imageUrl = await flux(prompt);
                break;

            case "sd":
            case "stable-diffusion":
                provider = "stable-diffusion";
                imageUrl = await stableDiffusion(prompt);
                break;

            default:
                const autoResult = await autoMode(prompt);
                provider = autoResult.provider;
                imageUrl = autoResult.url;
        }

        return res.json({ success: true, provider, imageUrl });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

// ------------------------------------------------------------
// STATUS ROUTE
// ------------------------------------------------------------
app.get("/", (req, res) => {
    res.send("🔥 Multi-model Image API (Free) Online!");
});

app.listen(PORT, () => console.log(`🚀 Server online na porta ${PORT}`));
