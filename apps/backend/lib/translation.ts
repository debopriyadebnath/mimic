import { GoogleGenerativeAI } from "@google/generative-ai";

const googleGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Supported languages mapping
export const SUPPORTED_LANGUAGES = {
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "it": "Italian",
  "pt": "Portuguese",
  "ru": "Russian",
  "ja": "Japanese",
  "zh": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  "ko": "Korean",
  "ar": "Arabic",
  "hi": "Hindi",
  "bn": "Bengali",
  "pa": "Punjabi",
  "ur": "Urdu",
  "vi": "Vietnamese",
  "th": "Thai",
  "pl": "Polish",
  "tr": "Turkish",
  "nl": "Dutch",
  "sv": "Swedish",
  "no": "Norwegian",
  "da": "Danish",
  "fi": "Finnish",
  "el": "Greek",
  "he": "Hebrew",
  "id": "Indonesian",
  "my": "Burmese",
  "ka": "Georgian",
  "uk": "Ukrainian",
};

/**
 * Translates text from a source language to English
 * Used to normalize trainer and user inputs to English for Gemini processing
 */
export async function translateToEnglish(
  text: string,
  sourceLanguage: string
): Promise<string> {
  try {
    // If already in English, return as is
    if (sourceLanguage === "en" || sourceLanguage === "en-US" || sourceLanguage === "en-GB") {
      return text;
    }

    const languageName = SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES] || "the user's language";

    const model = googleGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Translate the following text from ${languageName} to English. Provide only the translated text, nothing else.\n\nText: ${text}`,
            },
          ],
        },
      ],
    });

    let translatedText = "";
    if (result?.response && typeof result.response.text === "function") {
      translatedText = result.response.text();
    } else if (result?.response?.text && typeof result.response.text === "string") {
      translatedText = result.response.text;
    }

    return translatedText.trim() || text;
  } catch (error) {
    console.error("Translation to English error:", error);
    return text; // Return original text if translation fails
  }
}

/**
 * Translates text from English to a target language
 * Used to convert Gemini responses back to the user's preferred language
 */
export async function translateFromEnglish(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    // If target is English, return as is
    if (targetLanguage === "en" || targetLanguage === "en-US" || targetLanguage === "en-GB") {
      return text;
    }

    const languageName = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES] || "the user's language";

    const model = googleGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Translate the following text from English to ${languageName}. Provide only the translated text, nothing else.\n\nText: ${text}`,
            },
          ],
        },
      ],
    });

    let translatedText = "";
    if (result?.response && typeof result.response.text === "function") {
      translatedText = result.response.text();
    } else if (result?.response?.text && typeof result.response.text === "string") {
      translatedText = result.response.text;
    }

    return translatedText.trim() || text;
  } catch (error) {
    console.error("Translation from English error:", error);
    return text; // Return original text if translation fails
  }
}

/**
 * Two-way translation utility
 * Translates from source language to English, processes, then translates back
 */
export async function translateBidirectional(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    // If both languages are the same, return as is
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // If source is English, translate directly to target
    if (sourceLanguage === "en" || sourceLanguage === "en-US" || sourceLanguage === "en-GB") {
      return translateFromEnglish(text, targetLanguage);
    }

    // If target is English, translate from source
    if (targetLanguage === "en" || targetLanguage === "en-US" || targetLanguage === "en-GB") {
      return translateToEnglish(text, sourceLanguage);
    }

    // Otherwise: source -> English -> target
    const englishText = await translateToEnglish(text, sourceLanguage);
    return translateFromEnglish(englishText, targetLanguage);
  } catch (error) {
    console.error("Bidirectional translation error:", error);
    return text;
  }
}

/**
 * Detects the language of a given text
 * Uses Gemini to identify the language
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const model = googleGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Identify the language of the following text and respond with ONLY the language code (e.g., 'en', 'es', 'fr', 'hi', etc.) or 'unknown' if you cannot determine it.\n\nText: ${text}`,
            },
          ],
        },
      ],
    });

    let detectedLanguage = "en";
    if (result?.response && typeof result.response.text === "function") {
      detectedLanguage = result.response.text().trim().toLowerCase();
    } else if (
      result?.response?.text && 
      typeof result.response.text === "string"
    ) {
      detectedLanguage = (result.response.text as string).trim().toLowerCase();
    }

    // Validate the response
    if (detectedLanguage in SUPPORTED_LANGUAGES) {
      return detectedLanguage;
    }

    return "en"; // Default to English if detection fails
  } catch (error) {
    console.error("Language detection error:", error);
    return "en"; // Default to English on error
  }
}
