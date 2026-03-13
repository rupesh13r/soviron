export const dynamic = 'force-dynamic';
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Internal route for dashboard that uses Session tokens rather than explicit API keys
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, chars_used, chars_limit')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });

    const body = await req.json();
    const { text, speed = 1.0, pitch = 0, voice_id, format = 'mp3', exaggeration = 0.5, seed } = body;

    const charsRemaining = profile.chars_limit - profile.chars_used;
    if (text.length > charsRemaining) {
      return NextResponse.json({
        error: 'Insufficient characters remaining.',
        chars_remaining: charsRemaining,
      }, { status: 402 });
    }

    const cerebriumBody: any = {
      text,
      speed,
      pitch,
      exaggeration,
      format,
      ...(seed !== undefined && { seed }),
      ...(body.audio_prompt_b64 && { audio_prompt_b64: body.audio_prompt_b64 }),
    };

    if (voice_id) {
        const { data: voice } = await supabase.from('voices').select('file_path').eq('id', voice_id).eq('user_id', user.id).single();
        if (voice) {
            const { data: signed } = await supabase.storage.from('voices').createSignedUrl(voice.file_path, 60);
            if (signed) {
                const voiceRes = await fetch(signed.signedUrl);
                const voiceBlob = await voiceRes.blob();
                const audioBuffer = await voiceBlob.arrayBuffer();
                cerebriumBody.audio_prompt_b64 = Buffer.from(audioBuffer).toString('base64');
            }
        }
    }

    const cerebriumRes = await fetch('https://api.aws.us-east-1.cerebrium.ai/v4/p-c85ac149/soviron-tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRIUM_API_KEY}`
      },
      body: JSON.stringify(cerebriumBody)
    });

    if (!cerebriumRes.ok || !cerebriumRes.body) throw new Error('Cerebrium upstream error');

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let lineBuffer = '';
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        lineBuffer += decoder.decode(chunk, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${line.trim()}\n\n`));
          }
        }
      },
      flush(controller) {
        if (lineBuffer.trim()) {
          controller.enqueue(encoder.encode(`data: ${lineBuffer.trim()}\n\n`));
        }
      }
    });

    return new Response(cerebriumRes.body.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
