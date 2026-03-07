import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

const TOPUPS: Record<string, { amount: number; chars: number }> = {
  '50k':  { amount: 7900,  chars: 50000 },
  '200k': { amount: 24900, chars: 200000 },
  '1m':   { amount: 79900, chars: 1000000 },
}

export async function POST(request: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const { topup } = await request.json()
  if (!TOPUPS[topup]) return NextResponse.json({ error: 'Invalid top-up' }, { status: 400 })

  const order = await razorpay.orders.create({
    amount: TOPUPS[topup].amount,
    currency: 'INR',
    receipt: `topup_${topup}_${Date.now()}`,
  })

  return NextResponse.json({ order_id: order.id, amount: TOPUPS[topup].amount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID })
}
