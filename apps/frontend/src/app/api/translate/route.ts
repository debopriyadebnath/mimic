import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, targetLanguage, targetLanguageName } = body;

    if (!text || !targetLanguage || !targetLanguageName) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetLanguage, targetLanguageName' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Translate the following text to ${targetLanguageName} (language code: ${targetLanguage}). Return ONLY the translated text, nothing else. Do not add any explanations, notes, or prefixes. If the text is already in the target language, return it as-is.\n\nText to translate:\n${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translation = response.text().trim();

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    );
  }
}
