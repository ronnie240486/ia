import 'dotenv/config';
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => res.json({ success: true, message: "Servidor ativo!" }));
app.post("/generate-image", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "O campo 'prompt' é obrigatório." });
  res.json({ success: true, imageUrl: `https://via.placeholder.com/512?text=${encodeURIComponent(prompt)}` });
});

app.listen(PORT, () => console.log(`✅ Servidor de teste rodando na porta ${PORT}`));
