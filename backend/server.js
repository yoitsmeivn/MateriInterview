import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors());
app.use(express.json());


const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// unique IDs
function generateId() {
  return Date.now().toString();
}

// Save doc
app.post("/documents", (req, res) => {
  const newDoc = req.body;
  if (!newDoc.id) newDoc.id = generateId();
  const filePath = path.join(DATA_DIR, `${newDoc.id}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(newDoc, null, 2));
    console.log("Saved document:", filePath);
    res.status(201).json({ message: "Document created", id: newDoc.id });
  } catch (err) {
    console.error("Error saving document:", err);
    res.status(500).json({ error: "Failed to save document" });
  }
});

// List 
app.get("/documents", (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR);
    const docs = files.map((f) => {
      const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf8"));
      return { id: content.id, title: content.title };
    });
    res.json(docs);
  } catch (err) {
    console.error("Error reading documents:", err);
    res.status(500).json([]);
  }
});

//get doc
app.get("/documents/:id", (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Not found" });
  }
  const doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.json(doc);
});

// Delete 
app.delete("/documents/:id", (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Not found" });
  }
  fs.unlinkSync(filePath);
  console.log("Deleted:", filePath);
  res.json({ success: true });
});

// ai plotting
app.post("/api/ai", async (req, res) => {
  try {
    const { messages } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    let reply = completion.choices?.[0]?.message?.content || "";

    // error
    reply = reply
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, "")
      .replace(/\r\n/g, "\n")
      .trim();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ reply });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () =>
  console.log("Materi backend running at http://localhost:->")
);
