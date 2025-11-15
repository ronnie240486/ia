import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;

// ================= MODELOS CONFIÁVEIS =================
const MODELS = {
  "huggingface-sd": async (prompt) => {
    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data[0]?.url || null;
  },
  "openart": async (prompt) => {
    const res = await fetch("https://openart.ai/api/v1/text-to-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (!data.url) throw new Error("Não foi possível gerar a imagem");
    return data.url;
  },
  "pollinations": (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`,
  "pollinations-v2": (prompt) => `https://pollinations.ai/p/${encodeURIComponent(prompt)}`
};

// ================= ENDPOINT =================
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;
  const fn = MODELS[model];
  if (!fn) return res.status(400).json({ error: "Modelo desconhecido" });

  try {
    const imageUrl = await fn(prompt);
    res.json({ success: true, model, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
 
