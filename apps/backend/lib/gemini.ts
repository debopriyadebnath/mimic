export const GEMINI_MODEL = "gemini-1.5-flash";

export const GEMINI_MODEL_CANDIDATES = [
	"gemini-2.0-flash",
	"gemini-1.5-flash-002",
	"gemini-1.5-pro-002",
];

// Helper: try generateContent with a sequence of model candidates and return the first successful result.
export async function generateContentWithFallback(googleGenAI: any, payload: any) {
	const errors: Array<{ model: string; message: string }> = [];
	for (const modelName of GEMINI_MODEL_CANDIDATES) {
		try {
			const result = await googleGenAI.models.generateContent({
				model: modelName,
				...payload,
			});
			return { result, modelName };
		} catch (err: any) {
			errors.push({ model: modelName, message: err?.message || String(err) });
			// try next candidate
		}
	}
	const err = new Error(`All model candidates failed: ${JSON.stringify(errors)}`);
	throw err;
}