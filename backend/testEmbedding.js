import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log("Testing Gemini embedding...");
console.log("API key exists:", !!process.env.GEMINI_API_KEY);

try {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: "What is Hajj registration?",
  });

  console.log("✅ Embedding request succeeded!");
  console.log("Response:", response);

  const embedding = response.embeddings?.[0]?.values;

  console.log("Embedding exists:", !!embedding);
  console.log("Embedding length:", embedding?.length);
} catch (error) {
  console.error("❌ Embedding request failed:");
  console.error(error);
}