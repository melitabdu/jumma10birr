import supabase from "../config/supabase.js";

export const retrieveRelevantChunks = async (
  queryEmbedding,
  matchCount = 5,
  similarityThreshold = 0.60
) => {
  if (!queryEmbedding || queryEmbedding.length === 0) {
    throw new Error("Query embedding is required.");
  }

  const { data, error } = await supabase.rpc(
    "match_document_chunks",
    {
      query_embedding: queryEmbedding,
      match_count: matchCount,
    }
  );

  if (error) {
    console.error(
      "❌ Supabase retrieval error:",
      error
    );

    throw new Error(error.message);
  }

  console.log(
    `🔎 Retrieved ${data?.length || 0} chunks`
  );

  // Show the similarity score of every retrieved chunk
  console.log("📊 Similarity scores:");

  (data || []).forEach((chunk, index) => {
    console.log(
      `${index + 1}. ${chunk.similarity}`
    );
  });

  const chunks = (data || []).filter(
    (chunk) =>
      typeof chunk.similarity === "number" &&
      chunk.similarity >= similarityThreshold
  );

  console.log(
    `✅ ${chunks.length} chunks passed similarity threshold ${similarityThreshold}`
  );

  return chunks;
};