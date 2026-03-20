import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/tts-internal': { max: 10, windowMs: 60 * 1000 },
  '/api/tts': { max: 30, windowMs: 60 * 1000 },
  '/api/clone': { max: 5, windowMs: 60 * 1000 },
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const limit = LIMITS[path];
  if (!limit) return NextResponse.next();

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ??
             req.headers.get('x-real-ip') ??
             'unknown';
  const key = `${ip}:${path}`;
  const now = Date.now();

  const record = rateLimit.get(key);
  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + limit.windowMs });
    return NextResponse.next();
  }

  if (record.count >= limit.max) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429 }
    );
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/tts-internal', '/api/tts', '/api/clone'],
};
