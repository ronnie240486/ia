import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

const PORT = process.env.PORT || 8080;

// ======================================
// PROVIDERS
// ======================================

// ---------- POLLINATIONS ----------
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// ---------- HUGGINGFACE FLUX ----------
async function huggingfaceFlux(prompt) {
    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
        throw new Error("Erro no modelo Flux");
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:image/png;base64,${base64}`;
}

// ---------- STABLE DIFFUSION ----------
async function sdProxy(prompt) {
    const response = await fetch("https://stablediffusionapi.com/api/v3/text2img", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: process.env.SD_API_KEY,
            prompt,
            width: 512,
            height: 512,
            samples: 1,
            guidance_scale: 7,
            steps: 30
        })
    });

    if (!response.ok) throw new Error("Erro no Stable Diffusion");

    const data = await response.json();
    return data.output[0];
}

// ======================================
// ENDPOINT PRINCIPAL
// ======================================

app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt) return res.status(400).json({ error: "prompt é obrigatório" });
    if (!model) return res.status(400).json({ error: "model é obrigatório" });

    console.log("Modelo recebido:", model);

    try {
        let imageUrl;

        switch (model) {

            case "pollinations":
                imageUrl = pollinations(prompt);
                break;

            case "flux":
                if (!process.env.HF_TOKEN)
                    return res.status(500).json({ error: "HF_TOKEN não configurado no Railway" });

                imageUrl = await huggingfaceFlux(prompt);
                break;

            case "sd":
                if (!process.env.SD_API_KEY)
                    return res.status(500).json({ error: "SD_API_KEY não configurado no Railway" });

                imageUrl = await sdProxy(prompt);
                break;

            default:
                return res.status(400).json({ error: "Modelo desconhecido" });
        }

        return res.json({ success: true, model, imageUrl });

    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        return res.status(500).json({ error: err.message });
    }
});

// ======================================
// ROTA TESTE
// ======================================
app.get("/", (req, res) => {
    res.send("Backend online 🚀");
});

// ======================================
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
