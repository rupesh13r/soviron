import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use dummy values during build to prevent supabaseKey is required
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Auth check
    const authHeader = (req as any).headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { fingerprint } = await req.json();

    if (!fingerprint || typeof fingerprint !== 'string') {
      return NextResponse.json({ error: 'Fingerprint is required' }, { status: 400 });
    }
    if (fingerprint.length > 256) {
      return NextResponse.json({ error: 'Invalid fingerprint.' }, { status: 400 });
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('device_fingerprint', fingerprint)
      // Only care if ANY account exists with this physical device fingerprint
      .limit(1);

    if (error) {
      console.error('Supabase error checking fingerprint:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    // Determine if fingerprint exists
    const hasAccount = profiles && profiles.length > 0;

    return NextResponse.json({ hasAccount });

  } catch (err: any) {
    console.error('Check fingerprint error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
