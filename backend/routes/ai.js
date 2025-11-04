import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
