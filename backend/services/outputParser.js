/**
 * Parse and validate the structured response
 * returned by Gemini.
 */

export const parseChatbotResponse = (text) => {
  // ---------------------------------------
  // 1. Check for empty response
  // ---------------------------------------

  if (!text || !text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  let cleanedText = text.trim();

  // ---------------------------------------
  // 2. Remove Markdown code fences
  // ---------------------------------------

  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  // ---------------------------------------
  // 3. Parse JSON
  // ---------------------------------------

  let parsed;

  try {
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    console.error("❌ Failed to parse Gemini JSON:");
    console.error(cleanedText);

    throw new Error(
      "Gemini returned an invalid JSON response."
    );
  }

  // ---------------------------------------
  // 4. Validate JSON object
  // ---------------------------------------

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "Gemini response is not a valid JSON object."
    );
  }

  // ---------------------------------------
  // 5. Validate answer
  // ---------------------------------------

  if (
    typeof parsed.answer !== "string" ||
    !parsed.answer.trim()
  ) {
    throw new Error(
      "Gemini response does not contain a valid answer."
    );
  }

  // ---------------------------------------
  // 6. Validate hasAnswer
  // ---------------------------------------

  if (typeof parsed.hasAnswer !== "boolean") {
    throw new Error(
      "Gemini response does not contain a valid hasAnswer field."
    );
  }

  // ---------------------------------------
  // 7. Return clean response
  // ---------------------------------------

  return {
    answer: parsed.answer.trim(),
    hasAnswer: parsed.hasAnswer,
  };
};