import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8080;

// ================= MODELOS FUNCIONAIS =================
// Só incluí modelos que retornam link direto da imagem

// 1 — Pollinations v1
function pollinations(prompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// 2 — Pollinations v2
function pollinationsV2(prompt) {
  return `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;
}

// 3 — Pollinations Legacy
function pollinationsLegacy(prompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// 4 — Picsum (placeholder baseado em seed)
function picsum(prompt) {
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600`;
}

// 5 — Placeholder.com (gera imagem com texto do prompt)
function placeholder(prompt) {
  return `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(prompt)}`;
}

// 6 — Placehold.co (imagem com texto)
function placeholdCo(prompt) {
  return `https://placehold.co/600x600?text=${encodeURIComponent(prompt)}`;
}

// 7 — Lorem Picsum Grayscale
function picsumGray(prompt) {
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600?grayscale`;
}

// 8 — Lorem Picsum Blur
function picsumBlur(prompt) {
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600?blur=2`;
}

// 9 — DummyImage
function dummyImage(prompt) {
  return `https://dummyimage.com/600x600/000/fff&text=${encodeURIComponent(prompt)}`;
}

// 10 — Placeimg (nature/tech/art)
function placeImg(prompt) {
  const category = encodeURIComponent(prompt.split(" ")[0] || "any");
  return `https://placeimg.com/600/600/${category}`;
}

// 11 — Placeholder Text
function placeText(prompt) {
  return `https://place-text.com/600x600?text=${encodeURIComponent(prompt)}`;
}

// 12 — Bacon Mockup (divertido)
function baconMockup() {
  return `https://baconmockup.com/600/600`;
}

// 13 — Place Bear
function placeBear() {
  return `https://placebear.com/600/600`;
}

// 14 — PlaceKitten
function placeKitten() {
  return `https://placekitten.com/600/600`;
}

// 15 — Random Fox
function randomFox() {
  return `https://randomfox.ca/images/1.jpg`; // fix 1 por exemplo
}

// 16 — FakeFace Generator
function fakeFace() {
  return `https://fakeface.rest/face/view`; // link fixo, gera random
}

// 17 — PlaceCorgi
function placeCorgi() {
  return `https://placecorgi.com/600/600`;
}

// 18 — Placebeard
function placeBeard() {
  return `https://placebeard.it/600x600`;
}

// 19 — Random Placeholder Cat
function placeCat() {
  return `https://placekitten.com/601/601`;
}

// 20 — Random Placeholder Dog
function placeDog() {
  return `https://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true`;
}

// ==================================================================
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

// ==================================================================
// ENDPOINT
app.post("/generate-image", async (req, res) => {
  const { prompt, model } = req.body;
  const fn = MODELS[model];
  if (!fn) return res.status(400).json({ error: "Modelo desconhecido" });

  // Alguns retornam array de URL (shibe), tratamos
  let imageUrl = fn(prompt);
  if (model === "placedog") {
    try {
      const fetchRes = await fetch(imageUrl);
      const data = await fetchRes.json();
      imageUrl = data[0];
    } catch (err) {
      console.error("Erro fetching shibe:", err.message);
      imageUrl = "https://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true"; // fallback
    }
  }

  return res.json({ success: true, model, imageUrl });
});

app.get("/", (req, res) => res.send("🚀 Backend 20 modelos free, pronto para frontend"));

app.listen(PORT, () =>
  console.log(`Servidor rodando na porta ${PORT}`)
);
