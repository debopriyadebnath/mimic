import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AssemblyAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Request a temporary token for Universal Streaming (new API)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expires_in: 3600,
        // Specify the Universal streaming model
        encoding: 'pcm_s16le',
        sample_rate: 16000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI token error:', errorText);
      
      // If model is deprecated, return API key for direct WebSocket auth
      if (errorText.includes('deprecated')) {
        return NextResponse.json({ apiKey });
      }
      
      return NextResponse.json(
        { error: `Failed to get token: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('AssemblyAI token error:', error);
    
    // Fallback: return API key for direct WebSocket authentication
    return NextResponse.json({ apiKey });
  }
}
