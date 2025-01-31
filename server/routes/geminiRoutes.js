import axios from "axios";
import dotenv from "dotenv";
import express from "express";

const router = express.Router();

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT =
  "You are a helpful AI assistant. Only answer questions related to hackathons, projects, and innovation.";

router.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT} ${question}` }] },
        ],
      }
    );

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response received.";

    res.json({ question, answer });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to fetch response from Gemini." });
  }
});

router.post("/askAllHackathon", async (req, res) => {
  const { hackathons, question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  // Extract only necessary fields from hackathons and format them
  const hackathonDetails = hackathons
    .map(
      (h) =>
        `Name: ${h.name}, Description: ${h.description}, Start Date: ${new Date(
          h.startDate
        ).toLocaleDateString()}, Duration: ${h.duration} hours`
    )
    .join("\n");

  const SYSTEM_PROMPT2 =
    "You are a helpful AI assistant. Answer based only on the provided hackathons.";

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT2}\n${hackathonDetails}\nQuestion: ${question}`,
              },
            ],
          },
        ],
      }
    );

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response received.";

    res.json({ question, answer });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to fetch response from Gemini." });
  }
});

export default router;
