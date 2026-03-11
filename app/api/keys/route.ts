import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Use dummy values during build to prevent supabaseKey is required
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

const ALLOWED_PLANS = ['creator', 'pro', 'studio'];

// GET - list user's API keys
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, name, key, created_at, last_used, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ keys: keys || [] });
}

// POST - generate new API key
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  if (!profile || !ALLOWED_PLANS.includes(profile.plan)) {
    return NextResponse.json({
      error: 'API access requires Creator, Pro, or Studio plan.'
    }, { status: 403 });
  }

  // Check key limit (max 3 keys)
  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if ((count || 0) >= 3) {
    return NextResponse.json({ error: 'Maximum 3 active API keys allowed.' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const name = body.name || 'Default Key';

  // Generate key: sov_live_xxxxx
  const key = `sov_live_${randomBytes(24).toString('hex')}`;

  const { data: newKey, error } = await supabase
    .from('api_keys')
    .insert({ user_id: user.id, key, name })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create key.' }, { status: 500 });

  return NextResponse.json({ key: newKey });
}

// DELETE - revoke API key
export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { keyId } = await req.json();
  if (!keyId) return NextResponse.json({ error: 'keyId required.' }, { status: 400 });

  await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}