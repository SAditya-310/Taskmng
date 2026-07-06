import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.gemini_key,
});

router.get("/test", async (req, res) => {
  try {
    const prompt = "who are you?";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply =
      response.text?.trim() ||
      response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() ||
      "";
    if (!reply) {
      return res.status(500).json({
        error: "Gemini returned an empty response",
      });
    }

    res.json({
      prompt,
      reply,
    });
  } catch (err) {
    console.error(err);
    res.status(err?.status || 500).json({
      error: "Gemini failed",
      message: err?.message || "Unknown Gemini error",
    });
  }
});

export default router;