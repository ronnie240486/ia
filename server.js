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

const MODELS = {
  "huggingface-sd": "stable-diffusion-v1-5",
  "openart": "openart-text2img"
};

// Endpoint para gerar imagem
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt não definido" });

  try {
    let imageUrl;

    if (model === "huggingface-sd") {
      const response = await fetch(`https://api-inference.huggingface.co/models/${MODELS[model]}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Hugging Face retorna base64 ou URL dependendo do modelo
      imageUrl = data[0]?.url || null;
      if (!imageUrl) throw new Error("Não foi possível gerar imagem");
    }

    else if (model === "openart") {
      const response = await fetch("https://openart.ai/api/v1/text-to-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      imageUrl = data?.url || null;
      if (!imageUrl) throw new Error("Não foi possível gerar imagem");
    }

    else return res.status(400).json({ error: "Modelo desconhecido" });

    res.json({ success: true, model, imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
