import { NextRequest, NextResponse } from 'next/server';

const BACKENDS = [
  {
    name: 'Modal',
    url: 'https://rupeshrajbhar1508--soviron-tts-fastapi-app.modal.run/generate',
  },
  {
    name: 'Cerebrium',
    url: 'https://api.aws.us-east-1.cerebrium.ai/v4/p-c85ac149/soviron-tts/generate',
  },
  {
    name: 'GCP VM',
    url: 'http://35.206.231.152:8000/generate',
  },
];

export async function POST(req: NextRequest) {
  // Forward the raw FormData to each backend in order
  const formData = await req.formData();

  let lastError = '';

  for (const backend of BACKENDS) {
    try {
      console.log(`[proxy] Trying ${backend.name}...`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const res = await fetch(backend.url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        console.log(`[proxy] Success via ${backend.name}`);
        const audio = await res.arrayBuffer();
        return new NextResponse(audio, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'attachment; filename="soviron-output.wav"',
            'X-Backend': backend.name,
          },
        });
      }

      lastError = `${backend.name} returned ${res.status}`;
      console.log(`[proxy] ${lastError}, trying next...`);

    } catch (err: any) {
      lastError = `${backend.name} failed: ${err.message}`;
      console.log(`[proxy] ${lastError}, trying next...`);
    }
  }

  // All backends failed
  return NextResponse.json(
    { error: 'All backends are currently unavailable. Please try again in a moment.', detail: lastError },
    { status: 503 }
  );
}

export async function GET() {
  // Health check — ping all backends and return their status
  const results = await Promise.all(
    BACKENDS.map(async (backend) => {
      try {
        const healthUrl = backend.url.replace('/generate', '/health');
        const res = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
        return { name: backend.name, status: res.ok ? 'online' : 'error', code: res.status };
      } catch {
        return { name: backend.name, status: 'offline' };
      }
    })
  );
  return NextResponse.json({ backends: results });
}