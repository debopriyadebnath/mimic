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
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const isPartial = formData.get('partial') === 'true';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create the prompt for transcription
    const prompt = isPartial
      ? 'Transcribe this audio clip. Return ONLY the transcribed text, nothing else. If the audio is unclear or silent, return an empty string.'
      : 'Transcribe this audio recording accurately. Return ONLY the transcribed text with proper punctuation. If the audio is unclear or silent, return an empty string.';

    // Send to Gemini with inline audio data
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type || 'audio/webm',
          data: base64Audio,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const transcript = response.text().trim();

    // Filter out meta-responses like "I cannot transcribe" etc.
    const invalidResponses = [
      'i cannot',
      'i can\'t',
      'unable to',
      'no audio',
      'silent',
      'empty',
      'cannot transcribe',
      'no speech',
      'inaudible',
    ];

    const lowerTranscript = transcript.toLowerCase();
    const isInvalid = invalidResponses.some(phrase => lowerTranscript.includes(phrase));

    return NextResponse.json({ 
      transcript: isInvalid ? '' : transcript,
      partial: isPartial,
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
