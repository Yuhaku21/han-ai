export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { model, prompt } = req.body;
    if (!model || !prompt) {
      return res.status(400).json({ error: "model and prompt required" });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN not set" });
    }

    const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(txt);
    }

    const json = await r.json();
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
