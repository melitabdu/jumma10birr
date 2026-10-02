import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const createEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required to create an embedding.");
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Gemini did not return an embedding.");
  }

  return embedding;
};