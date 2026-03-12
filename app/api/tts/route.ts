import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use dummy values during build to prevent supabaseKey is required
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

const ALLOWED_PLANS = ['creator', 'pro', 'studio'];

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key. Pass it as x-api-key header.' }), { status: 401 });
    }

    const { data: keyData } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .single();

    if (!keyData) return new Response(JSON.stringify({ error: 'Invalid API key.' }), { status: 401 });
    if (!keyData.is_active) return new Response(JSON.stringify({ error: 'API key is revoked.' }), { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, chars_used, chars_limit')
      .eq('id', keyData.user_id)
      .single();

    if (!profile) return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });

    if (!ALLOWED_PLANS.includes(profile.plan)) {
      return new Response(JSON.stringify({
        error: 'API access requires Creator, Pro, or Studio plan.',
        upgrade_url: 'https://soviron.vercel.app/pricing'
      }), { status: 403 });
    }

    const body = await req.json();
    const { text, speed = 1.0, pitch = 0, voice_id, format = 'mp3', exaggeration = 0.5, seed } = body;

    if (!text) return new Response(JSON.stringify({ error: 'text field is required.' }), { status: 400 });
    if (text.length > 50000) return new Response(JSON.stringify({ error: 'Text exceeds 50,000 character limit.' }), { status: 400 });

    const charsRemaining = profile.chars_limit - profile.chars_used;
    if (text.length > charsRemaining) {
      return new Response(JSON.stringify({
        error: 'Insufficient characters remaining.',
        chars_remaining: charsRemaining,
        chars_requested: text.length
      }), { status: 402 });
    }

    // Prepare Cerebrium payload
    const cerebriumBody: any = {
      text,
      speed: parseFloat(Number(speed).toFixed(2)),
      pitch: parseFloat(Number(pitch).toFixed(2)),
      exaggeration: parseFloat(Number(exaggeration).toFixed(2)),
      format: String(format),
    };
    
    if (seed !== undefined) {
      cerebriumBody.seed = seed;
    }

    // Voice cloning — fetch saved voice from Supabase Storage
    if (voice_id) {
      const { data: voice } = await supabase
        .from('voices')
        .select('file_path, user_id')
        .eq('id', voice_id)
        .eq('user_id', keyData.user_id)
        .single();

      if (!voice) {
        return new Response(JSON.stringify({ error: 'Voice not found or does not belong to your account.' }), { status: 404 });
      }

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('voices')
        .createSignedUrl(voice.file_path, 60);

      if (signedUrlError || !signedUrlData) {
        return new Response(JSON.stringify({ error: 'Could not fetch voice file.' }), { status: 500 });
      }

      const voiceRes = await fetch(signedUrlData.signedUrl);
      const voiceBlob = await voiceRes.blob();
      const reader = new FileReader(); // Need node alternative
      
      const audioBuffer = await voiceBlob.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      cerebriumBody.audio_prompt_b64 = base64Audio;
    } else if (body.audio_prompt_b64) {
      cerebriumBody.audio_prompt_b64 = body.audio_prompt_b64;
    }

    // Forward to Cerebrium exactly as streaming proxy
    const cerebriumRes = await fetch('https://api.aws.us-east-1.cerebrium.ai/v4/p-c85ac149/soviron-tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRIUM_API_KEY}`
      },
      body: JSON.stringify(cerebriumBody)
    });

    if (!cerebriumRes.ok || !cerebriumRes.body) {
      return new Response(JSON.stringify({ error: 'TTS generation failed. Cerebrium service error.' }), { status: 503 });
    }

    // Update characters used immediately
    await supabase.from('profiles').update({
      chars_used: profile.chars_used + text.length
    }).eq('id', keyData.user_id);

    await supabase.from('api_keys').update({
      last_used: new Date().toISOString()
    }).eq('key', apiKey);

    // Transform Cerebrium JSON-L stream out into an SSE stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      start() {
        (this as any).lineBuffer = '';
      },
      transform(chunk, controller) {
        const textChunk = decoder.decode(chunk, { stream: true });
        (this as any).lineBuffer += textChunk;
        const lines = (this as any).lineBuffer.split('\n');
        // Last element may be incomplete — keep it in buffer
        (this as any).lineBuffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode('data: ' + line.trim() + '\n\n'));
          }
        }
      },
      flush(controller) {
        if ((this as any).lineBuffer.trim()) {
          controller.enqueue(encoder.encode('data: ' + (this as any).lineBuffer.trim() + '\n\n'));
        }
      }
    });

    const stream = cerebriumRes.body.pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Chars-Used': text.length.toString(),
        'X-Chars-Remaining': (charsRemaining - text.length).toString(),
      }
    });

  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    name: 'Soviron TTS API',
    version: '2.0',
    docs: 'https://soviron.vercel.app/api-docs',
    usage: {
      method: 'POST',
      headers: { 'x-api-key': 'your-api-key', 'Content-Type': 'application/json' },
      body: { text: 'Hello world', speed: 1.0, pitch: 0, voice_id: 'optional-saved-voice-uuid' },
      response: 'text/event-stream progressive chunks'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}