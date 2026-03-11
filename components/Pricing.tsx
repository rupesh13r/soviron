"use client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Try it out, no commitment",
    features: [
      "5,000 characters/month",
      "Standard voice quality",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "79",
    description: "Perfect for creators getting started",
    features: [
      "50,000 characters/month",
      "Standard voice quality",
      "Email support",
      "Top-ups available",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Standard",
    price: "149",
    description: "For professionals and growing creators",
    features: [
      "100,000 characters/month",
      "Save up to 5 voices",
      "Premium voice quality",
      "Priority support",
      "Top-ups available",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Creator",
    price: "349",
    description: "For high-volume creators with API needs",
    features: [
      "300,000 characters/month",
      "API access",
      "Priority support",
      "Top-ups available",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "699",
    description: "For power users and small teams",
    features: [
      "700,000 characters/month",
      "API access",
      "Priority support",
      "Top-ups available",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Studio",
    price: "1,299",
    description: "For teams and enterprises",
    features: [
      "1,500,000 characters/month",
      "Full API access",
      "Dedicated support",
      "Unlimited voice saves",
      "Top-ups available",
    ],
    cta: "Get started",
    highlighted: false,
  },
];

const topups = [
  { chars: "50,000", price: "79" },
  { chars: "200,000", price: "249" },
  { chars: "1,000,000", price: "799" },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-4 md:mb-6 text-black tracking-tight">
            Simple pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-16 md:mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative"
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black text-white text-sm font-semibold flex items-center gap-2 shadow-lg z-10">
                  <Zap className="w-4 h-4" />
                  Most popular
                </div>
              )}

              <div
                className={`relative h-full p-6 md:p-8 rounded-3xl bg-white border transition-all duration-300 ${
                  plan.highlighted ? "border-black/20 shadow-2xl" : "border-black/10 shadow-xl"
                }`}
                style={{
                  boxShadow: plan.highlighted
                    ? "0 30px 80px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.8)"
                    : "0 20px 50px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.8)",
                }}
              >
                <h3 className="text-2xl font-bold mb-2 text-black">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <div className="mb-6 md:mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-bold text-black">
                      {plan.price === "0" ? "Free" : `₹${plan.price}`}
                    </span>
                    {plan.price !== "0" && <span className="text-gray-500 text-sm md:text-base">/month</span>}
                  </div>
                </div>

                <a
                  href="/signup"
                  className={`block w-full py-4 rounded-xl font-semibold mb-8 transition-all text-center ${
                    plan.highlighted
                      ? "bg-black text-white shadow-xl shadow-black/20 hover:scale-105"
                      : "bg-gray-100 text-black border border-black/10 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </a>

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-black/5 border border-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top-ups section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-black mb-3">Need more characters?</h3>
            <p className="text-gray-600">Top up anytime — no plan change needed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topups.map((topup, index) => (
              <motion.div
                key={topup.chars}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-white border border-black/10 flex items-center justify-between"
                style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}
              >
                <div>
                  <div className="text-lg font-bold text-black">{topup.chars} chars</div>
                  <div className="text-sm text-gray-500">one-time</div>
                </div>
                <div className="text-2xl font-bold text-black">₹{topup.price}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
