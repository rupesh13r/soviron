import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fp = searchParams.get('fp');

  if (!fp) {
    return NextResponse.json({ error: 'Fingerprint required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('device_fingerprints')
    .select('user_id')
    .eq('fingerprint', fp)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is not found
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ exists: !!data });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    
    // Verify user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fingerprint } = await request.json();

    if (!fingerprint) {
      return NextResponse.json({ error: 'Fingerprint required' }, { status: 400 });
    }

    // 1. Check if fingerprint exists
    const { data: existingDevice } = await supabaseAdmin
      .from('device_fingerprints')
      .select('user_id')
      .eq('fingerprint', fingerprint)
      .single();

    if (existingDevice) {
      if (existingDevice.user_id !== user.id) {
         // This device belongs to a different user, so the current user is an alt account.
         // Penalize: set chars_limit to 0
         await supabaseAdmin
           .from('profiles')
           .update({ chars_limit: 0 })
           .eq('id', user.id);
      }
    } else {
      // 2. Register new fingerprint
      const { error } = await supabaseAdmin
        .from('device_fingerprints')
        .insert({ fingerprint, user_id: user.id });
        
      if (error && error.code !== '23505') { // Ignore unique violation
          console.error("Error inserting fingerprint", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
