import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const TOPUPS: Record<string, { chars: number }> = {
  '50k':  { chars: 50000 },
  '200k': { chars: 200000 },
  '1m':   { chars: 1000000 },
}

export async function POST(request: Request) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, topup } = await request.json()

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Validate topup key
  if (!topup || !Object.keys(TOPUPS).includes(topup)) {
    return NextResponse.json({ error: 'Invalid topup.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Add chars to existing limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('chars_limit')
    .eq('id', user.id)
    .single()

  await supabase.from('profiles').update({
    chars_limit: (profile?.chars_limit || 0) + TOPUPS[topup].chars,
  }).eq('id', user.id)

  return NextResponse.json({ success: true })
}
