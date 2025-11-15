import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;

// ================= MODELOS FUNCIONAIS =================
function pollinations(prompt){ return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`; }
function pollinationsV2(prompt){ return `https://pollinations.ai/p/${encodeURIComponent(prompt)}`; }
function pollinationsLegacy(prompt){ return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`; }
function picsum(prompt){ return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600`; }
function placeholder(prompt){ return `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(prompt)}`; }
function placeholdCo(prompt){ return `https://placehold.co/600x600?text=${encodeURIComponent(prompt)}`; }
function picsumGray(prompt){ return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600?grayscale`; }
function picsumBlur(prompt){ return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600?blur=2`; }
function dummyImage(prompt){ return `https://dummyimage.com/600x600/000/fff&text=${encodeURIComponent(prompt)}`; }
function placeImg(prompt){ const category = encodeURIComponent(prompt.split(" ")[0]||"any"); return `https://placeimg.com/600/600/${category}`; }
function placeText(prompt){ return `https://place-text.com/600x600?text=${encodeURIComponent(prompt)}`; }
function baconMockup(){ return `https://baconmockup.com/600/600`; }
function placeBear(){ return `https://placebear.com/600/600`; }
function placeKitten(){ return `https://placekitten.com/600/600`; }
function randomFox(){ return `https://randomfox.ca/images/1.jpg`; }
function fakeFace(){ return `https://fakeface.rest/face/view`; }
function placeCorgi(){ return `https://placecorgi.com/600/600`; }
function placeBeard(){ return `https://placebeard.it/600x600`; }
function placeCat(){ return `https://placekitten.com/601/601`; }
async function placeDog(){ 
    const res = await fetch("https://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true");
    const data = await res.json();
    return data[0];
}

// MAPA DE MODELOS
const MODELS = {
    "pollinations": pollinations,
    "pollinations-v2": pollinationsV2,
    "pollinations-legacy": pollinationsLegacy,
    "picsum": picsum,
    "placeholder": placeholder,
    "placehold-co": placeholdCo,
    "picsum-gray": picsumGray,
    "picsum-blur": picsumBlur,
    "dummyimage": dummyImage,
    "placeimg": placeImg,
    "place-text": placeText,
    "bacon": baconMockup,
    "placebear": placeBear,
    "kitten": placeKitten,
    "fox": randomFox,
    "fakeface": fakeFace,
    "placecorgi": placeCorgi,
    "placebeard": placeBeard,
    "placecat": placeCat,
    "placedog": placeDog
};

// ================= ENDPOINT =================
app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;
    const fn = MODELS[model];
    if (!fn) return res.status(400).json({ error: "Modelo desconhecido" });

    let imageUrl = await fn(prompt);
    res.json({ success: true, model, imageUrl });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
