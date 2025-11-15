import express from "express";
import cors from "cors";
import { fetch } from "undici";

const app = express();
app.use(express.json());

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const PORT = process.env.PORT || 8080;

// =============================================================
// PROVIDERS ★ 10 MODELOS 100% GRATUITOS
// =============================================================

// 1 — Pollinations
function pollinations(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// 2 — Pollinations v2
function pollinationsV2(prompt) {
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;
}

// 3 — Lexica Search Free
async function lexica(prompt) {
    const url = `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.images?.length) throw new Error("Nenhuma imagem encontrada na Lexica");
    return data.images[0].src;
}

// 4 — Shibe (shiba dogs)
async function shibe() {
    const res = await fetch("https://shibe.online/api/shibes");
    const data = await res.json();
    return data[0];
}

// 5 — PlaceKitten
function placeKitten() {
    const size = Math.floor(Math.random() * 300) + 300;
    return `https://placekitten.com/${size}/${size}`;
}

// 6 — Picsum Photos
function picsum() {
    const size = Math.floor(Math.random() * 500) + 300;
    return `https://picsum.photos/${size}`;
}

// 7 — Waifu Pics (anime)
async function waifu() {
    const res = await fetch("https://api.waifu.pics/sfw/waifu");
    const data = await res.json();
    return data.url;
}

// 8 — Random Fox
async function randomFox() {
    const res = await fetch("https://randomfox.ca/floof/");
    const data = await res.json();
    return data.image;
}

// 9 — Nekos.best
async function nekos() {
    const res = await fetch("https://nekos.best/api/v2/neko");
    const data = await res.json();
    return data.results[0].url;
}

// 10 — FakeFace Generator
async function fakeFace() {
    const res = await fetch("https://fakeface.rest/face/random");
    const data = await res.json();
    return data.image_url;
}

// =============================================================
// ENDPOINT PRINCIPAL
// =============================================================

app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;

    console.log("Modelo recebido:", model);

    try {
        let imageUrl;

        switch (model) {
            case "pollinations": imageUrl = pollinations(prompt); break;
            case "pollinations-v2": imageUrl = pollinationsV2(prompt); break;
            case "lexica": imageUrl = await lexica(prompt); break;
            case "shibe": imageUrl = await shibe(); break;
            case "kitten": imageUrl = placeKitten(); break;
            case "picsum": imageUrl = picsum(); break;
            case "waifu": imageUrl = await waifu(); break;
            case "fox": imageUrl = await randomFox(); break;
            case "neko": imageUrl = await nekos(); break;
            case "fakeface": imageUrl = await fakeFace(); break;

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
    res.send("🚀 Backend 10 MODELOS 100% FREE ONLINE");
});

// =============================================================
// START
// =============================================================

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
