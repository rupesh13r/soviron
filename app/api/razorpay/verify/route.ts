import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const PLAN_LIMITS: Record<string, { chars_limit: number }> = {
  starter:  { chars_limit: 50000 },
  standard: { chars_limit: 100000 },
  creator:  { chars_limit: 300000 },
  pro:      { chars_limit: 700000 },
  studio:   { chars_limit: 1500000 },
}

export async function POST(request: Request) {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan } = await request.json()

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex')

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  await supabase.from('profiles').update({
    plan,
    chars_limit: PLAN_LIMITS[plan].chars_limit,
    chars_used: 0,
    razorpay_subscription_id,
    subscription_status: 'active',
    plan_expires_at: expiresAt.toISOString(),
  }).eq('id', user.id)

  return NextResponse.json({ success: true })
}
