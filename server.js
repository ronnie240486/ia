import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const PORT = process.env.PORT || 8080;

// =============================================================
// PROVIDERS ★ MODELOS 100% GRATUITOS E LOCAIS / VERSÁTEIS
// =============================================================

// 1 — Pollinations
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// 2 — Pollinations v2
function pollinationsV2(prompt) {
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;
}

// 3 — Picsum Photos
function picsum() {
    const size = Math.floor(Math.random() * 500) + 300;
    return `https://picsum.photos/${size}`;
}

// 4 — Stable Diffusion v1.5 (placeholder)
function stableDiffusionV1_5(prompt) {
    return `stable-diffusion-v1.5://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 5 — Stable Diffusion XL (SDXL) (placeholder)
function stableDiffusionXL(prompt) {
    return `stable-diffusion-xl://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 6 — Dreamlike Photoreal 1.0 (placeholder)
function dreamlike1(prompt) {
    return `dreamlike-photoreal-1://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 7 — Dreamlike Photoreal 2.0 (placeholder)
function dreamlike2(prompt) {
    return `dreamlike-photoreal-2://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 8 — Anything v5 / 5.1 (placeholder)
function anythingV5(prompt) {
    return `anything-v5://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 9 — DeepFloyd IF (placeholder)
function deepFloydIF(prompt) {
    return `deepfloyd-if://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 10 — Waifu Diffusion (modo livre, placeholder)
function waifuDiffusion(prompt) {
    return `waifu-diffusion://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 11 — Stable Horde + SD local (placeholder)
function stableHorde(prompt) {
    return `stable-horde://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 12 — BoxDiff (placeholder)
function boxDiff(prompt) {
    return `boxdiff://generate?prompt=${encodeURIComponent(prompt)}`;
}

// 13 — ComfyUI (placeholder)
function comfyUI(prompt) {
    return `comfyui://generate?prompt=${encodeURIComponent(prompt)}`;
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
    res.send("🚀 Backend MODELOS 100% FREE ONLINE (Pollinations + Picsum + 10 modelos locais)");
});

// =============================================================
// START
// =============================================================

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
