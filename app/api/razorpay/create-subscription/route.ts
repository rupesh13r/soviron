import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const PLAN_IDS: Record<string, { amount: number; chars_limit: number }> = {
  starter:  { amount: 7900,   chars_limit: 50000 },
  standard: { amount: 14900,  chars_limit: 100000 },
  creator:  { amount: 34900,  chars_limit: 300000 },
  pro:      { amount: 69900,  chars_limit: 700000 },
  studio:   { amount: 129900, chars_limit: 1500000 },
}

export async function POST(request: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const { plan } = await request.json()
  if (!PLAN_IDS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const razorpayPlan = await razorpay.plans.create({
    period: 'monthly',
    interval: 1,
    item: {
      name: `Soviron ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
      amount: PLAN_IDS[plan].amount,
      currency: 'INR',
    },
  })

  const subscription = await razorpay.subscriptions.create({
    plan_id: razorpayPlan.id,
    customer_notify: 1,
    total_count: 12,
  })

  return NextResponse.json({ subscription_id: subscription.id, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID })
}
