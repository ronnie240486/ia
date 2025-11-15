import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8080;

// ================= MODELOS =================
function pollinations(prompt){ return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`; }
function pollinationsV2(prompt){ return `https://pollinations.ai/p/${encodeURIComponent(prompt)}`; }
function openArt(prompt){ return `https://openart.ai/api/v1/text-to-image?prompt=${encodeURIComponent(prompt)}`; }
function hfA(prompt){ return `https://hf-mirror-a.hf.space/sd?prompt=${encodeURIComponent(prompt)}`; }
function hfB(prompt){ return `https://hf-mirror-b.hf.space/sd?prompt=${encodeURIComponent(prompt)}`; }
function lykon(prompt){ return `https://api-inference.lykon.ai/sd?prompt=${encodeURIComponent(prompt)}`; }
function fd1(prompt){ return `https://freediffusion-api-1.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`; }
function fd2(prompt){ return `https://freediffusion-api-2.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`; }
function fd3(prompt){ return `https://free-sd-api-production.up.railway.app/sd?prompt=${encodeURIComponent(prompt)}`; }
function sdLite(prompt){ return `https://sd-lite.vercel.app/api/generate?prompt=${encodeURIComponent(prompt)}`; }
function liteDiff(prompt){ return `https://litediffusion.glitch.me/api?prompt=${encodeURIComponent(prompt)}`; }
function sdxlLite(prompt){ return `https://sdxl-lite.fly.dev/txt2img?prompt=${encodeURIComponent(prompt)}`; }
function prodia(prompt){ return `https://prodia-mirror.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`; }
function sai(prompt){ return `https://sai-free.azurewebsites.net/txt2img?prompt=${encodeURIComponent(prompt)}`; }
function t2i(prompt){ return `https://t2i-free.glitch.me/gen?prompt=${encodeURIComponent(prompt)}`; }
function openJourney(prompt){ return `https://openjourney-proxy.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`; }
function dreamshaper(prompt){ return `https://dreamshaper-api.glitch.me/sd?prompt=${encodeURIComponent(prompt)}`; }
function deliberate(prompt){ return `https://deliberate-proxy.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`; }
function portrait(prompt){ return `https://portrait-diffusion.glitch.me/txt2img?prompt=${encodeURIComponent(prompt)}`; }
function realistic(prompt){ return `https://realistic-vision-api.glitch.me/generate?prompt=${encodeURIComponent(prompt)}`; }
function picsum(){ return `https://picsum.photos/seed/${Math.random()}/600`; }
function pollinationsLegacy(prompt){ return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`; }

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

// ================= ENDPOINT =================
app.post("/generate-image", (req, res) => {
  const { prompt, model } = req.body;
  const fn = MODELS[model];
  if (!fn) return res.status(400).json({ error: "Modelo desconhecido" });
  const imageUrl = fn(prompt || "");
  res.json({ success: true, model, imageUrl });
});

app.get("/", (req, res) => res.send("🚀 Backend 22 modelos free online"));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
