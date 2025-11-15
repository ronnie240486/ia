import express from "express";
import cors from "cors";
import { fetch } from "undici";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const PORT = process.env.PORT || 8080;

// =============== MODELOS FREE QUE RESPEITAM PROMPT =================

// 1 — Pollinations v1
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// 2 — Pollinations v2
function pollinationsV2(prompt) {
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;
}

// 3 — OpenArt SD1.5
function openArt(prompt) {
    return `https://openart.ai/api/v1/text-to-image?prompt=${encodeURIComponent(prompt)}`;
}

// 4 — HF Mirror A
function hfA(prompt) {
    return `https://hf-mirror-a.hf.space/sd?prompt=${encodeURIComponent(prompt)}`;
}

// 5 — HF Mirror B
function hfB(prompt) {
    return `https://hf-mirror-b.hf.space/sd?prompt=${encodeURIComponent(prompt)}`;
}

// 6 — Lykon Free
function lykon(prompt) {
    return `https://api-inference.lykon.ai/sd?prompt=${encodeURIComponent(prompt)}`;
}

// 7 — FreeDiffusion Mirror 1
function fd1(prompt) {
    return `https://freediffusion-api-1.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 8 — FreeDiffusion Mirror 2
function fd2(prompt) {
    return `https://freediffusion-api-2.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 9 — FreeDiffusion Mirror 3
function fd3(prompt) {
    return `https://free-sd-api-production.up.railway.app/sd?prompt=${encodeURIComponent(prompt)}`;
}

// 10 — SD Lite
function sdLite(prompt) {
    return `https://sd-lite.vercel.app/api/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 11 — LiteDiffusion
function liteDiff(prompt) {
    return `https://litediffusion.glitch.me/api?prompt=${encodeURIComponent(prompt)}`;
}

// 12 — SDXL Lite
function sdxlLite(prompt) {
    return `https://sdxl-lite.fly.dev/txt2img?prompt=${encodeURIComponent(prompt)}`;
}

// 13 — Prodia Mirror
function prodia(prompt) {
    return `https://prodia-mirror.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 14 — SAI Free Proxy
function sai(prompt) {
    return `https://sai-free.azurewebsites.net/txt2img?prompt=${encodeURIComponent(prompt)}`;
}

// 15 — Text2Image Engine
function t2i(prompt) {
    return `https://t2i-free.glitch.me/gen?prompt=${encodeURIComponent(prompt)}`;
}

// 16 — OpenJourney
function openJourney(prompt) {
    return `https://openjourney-proxy.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 17 — DreamShaper
function dreamshaper(prompt) {
    return `https://dreamshaper-api.glitch.me/sd?prompt=${encodeURIComponent(prompt)}`;
}

// 18 — Deliberate Model
function deliberate(prompt) {
    return `https://deliberate-proxy.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 19 — Portrait Diffusion
function portrait(prompt) {
    return `https://portrait-diffusion.glitch.me/txt2img?prompt=${encodeURIComponent(prompt)}`;
}

// 20 — Realistic Vision
function realistic(prompt) {
    return `https://realistic-vision-api.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 21 — Picsum (não respeita prompt, mas você pediu pra manter)
function picsum() {
    return `https://picsum.photos/seed/${Math.random()}/600`;
}

// 22 — Pollinations (manter)
function pollinationsLegacy(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// ==================================================================
// ENDPOINT
// ==================================================================

app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;

    const MODELS = {
        "pollinations": pollinations,
        "pollinations-v2": pollinationsV2,
        "openart": openArt,
        "hf-a": hfA,
        "hf-b": hfB,
        "lykon": lykon,
        "fd1": fd1,
        "fd2": fd2,
        "fd3": fd3,
        "sd-lite": sdLite,
        "litediff": liteDiff,
        "sdxl-lite": sdxlLite,
        "prodia": prodia,
        "sai": sai,
        "t2i": t2i,
        "openjourney": openJourney,
        "dreamshaper": dreamshaper,
        "deliberate": deliberate,
        "portrait": portrait,
        "realistic": realistic,
        "picsum": picsum,
        "pollinations-legacy": pollinationsLegacy
    };

    const fn = MODELS[model];
    if (!fn) return res.status(400).json({ error: "Modelo desconhecido" });

    const url = fn(prompt || "");
    return res.json({ success: true, model, imageUrl: url });
});

// ==================================================================

app.get("/", (req, res) => {
    res.send("🚀 Backend 22 modelos free online");
});

app.listen(PORT, () =>
    console.log(`Servidor rodando na porta ${PORT}`)
);
