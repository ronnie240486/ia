import express from "express";
import cors from "cors";
import { fetch } from "undici";

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());

const PORT = process.env.PORT || 8080;

// ============================================================
// PROVIDERS 100% FREE
// ============================================================

// ---------- POLLINATIONS (grátis e sem limite) ----------
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// ---------- FLUX grátis via fal.ai ----------
async function fluxFree(prompt) {
    const url = `https://fal.run/fal-ai/flux/schnell`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (data?.image?.url) {
        return data.image.url;
    }

    throw new Error("Erro ao gerar imagem com FLUX Free fal.ai");
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

            case "flux-free":
                imageUrl = await fluxFree(prompt);
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
    res.send("Backend IA 100% FREE online 🚀");
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
