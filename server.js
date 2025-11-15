import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { fetch as undiciFetch, FormData as UndiciFormData } from "undici";
import { fetch as undiciFetch } from "undici";

const app = express();
app.use(express.json());

// CORS universal
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

const PORT = process.env.PORT || 8080;

// ============================================================
// PROVIDERS
// ============================================================

// ---------- POLLINATIONS ----------
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// ---------- HUGGINGFACE FLUX ----------
async function huggingfaceFlux(prompt) {
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        throw new Error("HF_TOKEN não configurado no Railway");
    }

    const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        }
    );

    if (!response.ok) {
        throw new Error("Erro no HuggingFace Flux");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:image/png;base64,${buffer.toString("base64")}`;
}

// -------- STABILITY AI — FormData NATIVO DO UNDICI --------
import { FormData as UndiciFormData, File } from "undici";

async function sdProxy(prompt) {
    const key = process.env.SD_API_KEY;

    if (!key) {
        throw new Error("SD_API_KEY não configurado no Railway");
    }

    const form = new UndiciFormData();
    form.append("prompt", prompt);
    form.append("output_format", "webp");

    const response = await undiciFetch(
        "https://api.stability.ai/v2beta/stable-image/generate/core",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Accept": "application/json"
            },
            body: form
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Erro SD:", data);
        throw new Error("Erro no Stable Diffusion Proxy");
    }

    return `data:image/webp;base64,${data.image}`;
}



// ============================================================
// ENDPOINT PRINCIPAL
// ============================================================

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

            case "huggingface-flux":
                imageUrl = await huggingfaceFlux(prompt);
                break;

            case "sd-proxy":
                imageUrl = await sdProxy(prompt);
                break;

            default:
                return res.status(400).json({ error: "Modelo desconhecido" });
        }

        return res.json({ success: true, model, imageUrl });

    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// ROTA TESTE
// ============================================================
app.get("/", (req, res) => {
    res.send("Backend online 🚀");
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
    console.log("POLLINATIONS: OK (sempre funciona)");
    console.log("HF_TOKEN:", process.env.HF_TOKEN ? "OK" : "MISSING");
    console.log("SD_API_KEY:", process.env.SD_API_KEY ? "OK" : "MISSING");
});
