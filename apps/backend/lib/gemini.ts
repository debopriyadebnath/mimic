export const GEMINI_MODEL = "gemini-1.5-flash";

export const GEMINI_MODEL_CANDIDATES = [
	// preferred first, then fallbacks
	"gemini-1.5-flash",
	"gemini-1.5-flash-latest",
	"gemini-1.5",
	// Generic fallback for text generation if Gemini variants are unavailable
	"text-bison-001",
];

// Helper: try generateContent with a sequence of model candidates and return the first successful result.
export async function generateContentWithFallback(googleGenAI: any, payload: any) {
	const errors: Array<{ model: string; message: string }> = [];
	for (const modelName of GEMINI_MODEL_CANDIDATES) {
		try {
			const model = googleGenAI.getGenerativeModel({ model: modelName });
			const result = await model.generateContent(payload);
			return { result, modelName };
		} catch (err: any) {
			errors.push({ model: modelName, message: err?.message || String(err) });
			// try next candidate
		}
	}
	const err = new Error(`All model candidates failed: ${JSON.stringify(errors)}`);
	throw err;
}