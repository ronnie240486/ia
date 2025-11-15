import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const PORT = process.env.PORT || 8080;

// =============================================================
// PROVIDERS ★ MODELOS 100% GRATUITOS E LOCAIS / PLACEHOLDER
// =============================================================

// =============================================================
// Funções Pollinations e Picsum (placeholder)
// =============================================================

// 1 — Pollinations
function pollinations(prompt) {
    // TODO: Integrar lógica real de geração de imagem local ou via SD
    return `pollinations://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

// 2 — Pollinations V2
function pollinationsV2(prompt) {
    // TODO: Integrar lógica real de geração de imagem local ou via SDXL
    return `pollinations-v2://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

// 3 — Picsum Photos
function picsum() {
    // Picsum não gera a partir de prompt, apenas retorna imagem aleatória
    const size = Math.floor(Math.random() * 500) + 300;
    return `https://picsum.photos/${size}`;
}

// =============================================================
// Modelos locais placeholders
// =============================================================

function stableDiffusionV1_5(prompt) {
    // TODO: Integrar Stable Diffusion v1.5 local
    return `stable-diffusion-v1.5://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function stableDiffusionXL(prompt) {
    // TODO: Integrar Stable Diffusion XL local
    return `stable-diffusion-xl://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function dreamlike1(prompt) {
    // TODO: Integrar Dreamlike Photoreal 1.0 local
    return `dreamlike-1://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function dreamlike2(prompt) {
    // TODO: Integrar Dreamlike Photoreal 2.0 local
    return `dreamlike-2://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function anythingV5(prompt) {
    // TODO: Integrar Anything v5 local
    return `anything-v5://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function deepFloydIF(prompt) {
    // TODO: Integrar DeepFloyd IF local
    return `deepfloyd-if://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function waifuDiffusion(prompt) {
    // TODO: Integrar Waifu Diffusion modo livre local
    return `waifu-diffusion://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function stableHorde(prompt) {
    // TODO: Integrar Stable Horde local
    return `stable-horde://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function boxDiff(prompt) {
    // TODO: Integrar BoxDiff local
    return `boxdiff://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

function comfyUI(prompt) {
    // TODO: Integrar ComfyUI local
    return `comfyui://placeholder?prompt=${encodeURIComponent(prompt)}`;
}

// =============================================================
// ENDPOINT PRINCIPAL
// =============================================================

app.post("/generate-image", (req, res) => {
    const { prompt, model } = req.body;

    console.log("Modelo recebido:", model);

    try {
        let imageUrl;

        switch (model) {
            case "pollinations": imageUrl = pollinations(prompt); break;
            case "pollinations-v2": imageUrl = pollinationsV2(prompt); break;
            case "picsum": imageUrl = picsum(); break;
            case "stable-v1.5": imageUrl = stableDiffusionV1_5(prompt); break;
            case "sdxl": imageUrl = stableDiffusionXL(prompt); break;
            case "dreamlike-1": imageUrl = dreamlike1(prompt); break;
            case "dreamlike-2": imageUrl = dreamlike2(prompt); break;
            case "anything-v5": imageUrl = anythingV5(prompt); break;
            case "deepfloyd-if": imageUrl = deepFloydIF(prompt); break;
            case "waifu-diffusion": imageUrl = waifuDiffusion(prompt); break;
            case "stable-horde": imageUrl = stableHorde(prompt); break;
            case "boxdiff": imageUrl = boxDiff(prompt); break;
            case "comfyui": imageUrl = comfyUI(prompt); break;
            default:
                return res.status(400).json({ error: "Modelo desconhecido" });
        }

        // Retorna o placeholder para integração futura
        return res.json({ success: true, model, imageUrl });
    } catch (err) {
        console.error("Erro:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
// ROTA TESTE
// =============================================================

app.get("/", (req, res) => {
    res.send("🚀 Backend MODELOS PLACEHOLDER (Pollinations + Picsum + 10 modelos locais)");
});

// =============================================================
// START
// =============================================================

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
