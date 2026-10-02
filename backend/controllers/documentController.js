import { GoogleGenAI } from "@google/genai";
import supabase from "../config/supabase.js";
import { PDFParse } from "pdf-parse";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ======================================================
// SPLIT TEXT INTO CHUNKS
// ======================================================

const splitIntoChunks = (
  text,
  chunkSize = 250,
  overlap = 50
) => {
  const words = text.trim().split(/\s+/);

  const chunks = [];

  for (
    let i = 0;
    i < words.length;
    i += chunkSize - overlap
  ) {
    const chunk = words
      .slice(i, i + chunkSize)
      .join(" ");

    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }

  return chunks;
};


// ======================================================
// EXTRACT TEXT FROM UPLOADED FILE
// ======================================================

const extractTextFromFile = async (file) => {
  if (!file) {
    throw new Error("No document file was uploaded.");
  }

  // ----------------------------------------------------
  // PDF
  // ----------------------------------------------------

  if (file.mimetype === "application/pdf") {
    console.log("📄 Extracting text from PDF...");

    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const result = await parser.getText();

      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  // ----------------------------------------------------
  // TXT
  // ----------------------------------------------------

  if (file.mimetype === "text/plain") {
    console.log("📄 Reading TXT file...");

    return file.buffer.toString("utf-8");
  }

  // ----------------------------------------------------
  // Unsupported file
  // ----------------------------------------------------

  throw new Error(
    "This file type is not supported yet. Please upload a PDF or TXT file."
  );
};
// ======================================================
// CREATE EMBEDDING WITH RETRY
// ======================================================

const createEmbeddingWithRetry = async (
  text,
  maxRetries = 3
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🧠 Creating embedding (attempt ${attempt}/${maxRetries})`
      );

      const embeddingResponse =
        await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: text,
        });

      const embedding =
        embeddingResponse.embeddings?.[0]?.values;

      if (!embedding) {
        throw new Error(
          "Gemini did not return an embedding."
        );
      }

      console.log(
        `📐 Embedding dimensions: ${embedding.length}`
      );

      return embedding;
    } catch (error) {
      const errorMessage =
        error?.message || "";

      const isRateLimit =
        error?.status === 429 ||
        error?.code === 429 ||
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED");

      if (!isRateLimit) {
        throw error;
      }

      console.log(
        `⚠️ Gemini rate limit reached.`
      );

      if (attempt === maxRetries) {
        throw new Error(
          "Gemini embedding quota/rate limit was reached after multiple attempts."
        );
      }

      // Wait longer after each failed attempt
      const waitTime = attempt * 5000;

      console.log(
        `⏳ Waiting ${waitTime / 1000} seconds before retry...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, waitTime)
      );
    }
  }
};

// ======================================================
// CREATE DOCUMENT
//
// PDF/TXT
//    ↓
// Extract text
//    ↓
// Supabase documents
//    ↓
// Split into chunks
//    ↓
// Gemini embeddings
//    ↓
// Supabase document_chunks
// ======================================================

export const createDocument = async (req, res) => {
  try {
    console.log("==========================================");
    console.log("📄 CREATE DOCUMENT");
    console.log("==========================================");

    // --------------------------------------------------
    // 1. Show received request
    // --------------------------------------------------

    console.log("BODY:", req.body);

    console.log("FILE:", {
      fieldname: req.file?.fieldname,
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
    });

    // --------------------------------------------------
    // 2. Validate uploaded file
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document.",
      });
    }

    // --------------------------------------------------
    // 3. Get form fields
    // --------------------------------------------------

    const {
      title,
      description,
      category,
      language,
      source,
    } = req.body;

    // --------------------------------------------------
    // 4. Validate title
    // --------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required.",
      });
    }

    // --------------------------------------------------
    // 5. Extract text from uploaded document
    // --------------------------------------------------

    console.log("📖 Extracting document text...");

    const extractedText = await extractTextFromFile(
      req.file
    );

    // --------------------------------------------------
    // 6. Validate extracted text
    // --------------------------------------------------

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No readable text was found in the uploaded document.",
      });
    }

    console.log(
      `✅ Extracted ${extractedText.length} characters`
    );

    // --------------------------------------------------
    // 7. Show text preview
    //
    // Useful for checking Amharic PDF extraction.
    // --------------------------------------------------

    console.log(
      "📖 Extracted text preview:"
    );

    console.log(
      extractedText.substring(0, 500)
    );

    // --------------------------------------------------
    // 8. Save document to Supabase
    // --------------------------------------------------

    console.log(
      "💾 Saving document to Supabase..."
    );

    const { data: document, error: documentError } =
      await supabase
        .from("documents")
        .insert([
          {
            title: title.trim(),

            category:
              category?.trim() || "Hajj",

            language:
              language?.trim() || "en",

            content:
              extractedText.trim(),

            source:
              source?.trim() || "EIASC Hajj",
          },
        ])
        .select()
        .single();

    // --------------------------------------------------
    // 9. Handle document insert error
    // --------------------------------------------------

    if (documentError) {
      console.error(
        "❌ Document insert error:",
        documentError
      );

      return res.status(500).json({
        success: false,
        message: "Could not save document.",
        error: documentError.message,
      });
    }

    console.log(
      "✅ Document created:",
      document.id
    );

    // --------------------------------------------------
    // 10. Split document into chunks
    // --------------------------------------------------

    const chunks = splitIntoChunks(
      extractedText
    );

    console.log(
      `📚 Created ${chunks.length} chunks`
    );

    // --------------------------------------------------
    // 11. Generate embeddings + save chunks
    // --------------------------------------------------

    const savedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];

      console.log(
        `🧠 Embedding chunk ${i + 1}/${chunks.length}`
      );

      // ----------------------------------------------
      // Generate Gemini embedding
      // ----------------------------------------------

      const embedding =
  await createEmbeddingWithRetry(
    chunkContent
  );
      // ----------------------------------------------
      // Save chunk to Supabase
      // ----------------------------------------------

      const {
        data: savedChunk,
        error: chunkError,
      } = await supabase
        .from("document_chunks")
        .insert([
          {
            document_id: document.id,
            content: chunkContent,
            chunk_index: i,
            embedding,
          },
        ])
        .select()
        .single();

      // ----------------------------------------------
      // Handle chunk error
      // ----------------------------------------------

      if (chunkError) {
        console.error(
          `❌ Chunk ${i} insert error:`,
          chunkError
        );

        continue;
      }

      savedChunks.push(savedChunk);

      console.log(
        `✅ Chunk ${i + 1} saved`
      );
    }

    // --------------------------------------------------
    // 12. Final result
    // --------------------------------------------------

    console.log("==========================================");
    console.log("🎉 DOCUMENT PROCESSING COMPLETE");
    console.log("==========================================");

    return res.status(201).json({
      success: true,

      message:
        "Document uploaded, processed, and embedded successfully.",

      document: {
        id: document.id,
        title: document.title,
        category: document.category,
        language: document.language,
        source: document.source,
        filename: req.file.originalname,
      },

      textCharacters:
        extractedText.length,

      chunksCreated:
        savedChunks.length,
    });
  } catch (error) {
    // --------------------------------------------------
    // Global error handler
    // --------------------------------------------------

    console.error(
      "❌ Create document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Document creation failed.",
      error: error.message,
    });
  }
};