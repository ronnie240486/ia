// CORS 100% compatível com navegador
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

// Test route for frontend connection
app.get("/", (req, res) => {
    res.send("Backend online 🚀");
});

            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            width: 1024,
            height: 1024,
            quality: "high",
            response_format: "url"  // <<< importantíssimo
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`DEAPI retornou ${response.status}: ${err}`);
    }

    const data = await response.json();

    // novo formato corretíssimo
    if (!data.output || !data.output[0]) {
        throw new Error("DEAPI não devolveu URL da imagem.");
    }

    return data.output[0];
}

// ======== ENDPOINT PRINCIPAL ===========
app.post("/generate-image", async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt é obrigatório." });
    }

    try {
        let imageUrl;

        if (model === "deapi") {
            try {
                imageUrl = await gerarImagemDeAPI(prompt);
            } catch (err) {
                console.error("Erro DEAPI → fallback para Pollinations:", err.message);
                imageUrl = gerarImagemPollinations(prompt);
            }
        } else if (model === "pollinations") {
            imageUrl = gerarImagemPollinations(prompt);
        } else {
            return res.status(400).json({ error: `Modelo inválido: ${model}` });
        }

        res.json({ success: true, imageUrl });

    } catch (err) {
        console.error("Erro geral:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("DEAPI_KEY:", DEAPI_API_KEY ? "OK" : "MISSING");
});

