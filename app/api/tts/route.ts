import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json({ error: 'Missing API key. Pass it as x-api-key header.' }, { status: 401 });
    }

    const { data: keyData } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .single();

    if (!keyData) return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 });
    if (!keyData.is_active) return NextResponse.json({ error: 'API key is revoked.' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, chars_used, chars_limit')
      .eq('id', keyData.user_id)
      .single();

    if (!profile) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    if (!ALLOWED_PLANS.includes(profile.plan)) {
      return NextResponse.json({
        error: 'API access requires Creator, Pro, or Studio plan.',
        upgrade_url: 'https://soviron.vercel.app/pricing'
      }, { status: 403 });
    }

    const body = await req.json();
    const { text, speed = 1.0, pitch = 0, voice_id } = body;

    if (!text) return NextResponse.json({ error: 'text field is required.' }, { status: 400 });
    if (text.length > 50000) return NextResponse.json({ error: 'Text exceeds 50,000 character limit.' }, { status: 400 });

    const charsRemaining = profile.chars_limit - profile.chars_used;
    if (text.length > charsRemaining) {
      return NextResponse.json({
        error: 'Insufficient characters remaining.',
        chars_remaining: charsRemaining,
        chars_requested: text.length
      }, { status: 402 });
    }

    const formData = new FormData();
    formData.append('text', text);
    formData.append('speed', speed.toString());
    formData.append('pitch', pitch.toString());

    // Voice cloning — fetch saved voice from Supabase Storage
    if (voice_id) {
      const { data: voice } = await supabase
        .from('voices')
        .select('file_path, user_id')
        .eq('id', voice_id)
        .eq('user_id', keyData.user_id)
        .single();

      if (!voice) {
        return NextResponse.json({ error: 'Voice not found or does not belong to your account.' }, { status: 404 });
      }

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('voices')
        .createSignedUrl(voice.file_path, 60);

      if (signedUrlError || !signedUrlData) {
        return NextResponse.json({ error: 'Could not fetch voice file.' }, { status: 500 });
      }

      const voiceRes = await fetch(signedUrlData.signedUrl);
      const voiceBlob = await voiceRes.blob();
      const voiceFile = new File([voiceBlob], 'voice.wav', { type: 'audio/wav' });
      formData.append('audio_prompt', voiceFile);
    }

    const vmRes = await fetch(`${process.env.NEXT_PUBLIC_VM_URL}/generate`, {
      method: 'POST',
      body: formData,
    });

    if (!vmRes.ok) {
      return NextResponse.json({ error: 'TTS generation failed. VM may be offline.' }, { status: 503 });
    }

    await supabase.from('profiles').update({
      chars_used: profile.chars_used + text.length
    }).eq('id', keyData.user_id);

    await supabase.from('api_keys').update({
      last_used: new Date().toISOString()
    }).eq('key', apiKey);

    const audioBuffer = await vmRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="soviron-output.wav"',
        'X-Chars-Used': text.length.toString(),
        'X-Chars-Remaining': (charsRemaining - text.length).toString(),
      }
    });

  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Soviron TTS API',
    version: '1.0',
    docs: 'https://soviron.vercel.app/api-docs',
    usage: {
      method: 'POST',
      headers: { 'x-api-key': 'your-api-key', 'Content-Type': 'application/json' },
      body: { text: 'Hello world', speed: 1.0, pitch: 0, voice_id: 'optional-saved-voice-uuid' },
      response: 'audio/wav binary'
    }
  });
}