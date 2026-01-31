export const SUPPORTED_LANGUAGES: Record<string, string> = {
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

export const getLanguageName = (code: string): string => {
  return SUPPORTED_LANGUAGES[code] || "English";
};

export const getLanguageCode = (name: string): string => {
  const entry = Object.entries(SUPPORTED_LANGUAGES).find(([_, v]) => v === name);
  return entry ? entry[0] : "en";
};
