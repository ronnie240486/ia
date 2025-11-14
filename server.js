import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => res.json({ success: true, message: "Servidor ativo!" }));

app.listen(PORT, () => console.log(`✅ Servidor de teste rodando na porta ${PORT}`));

