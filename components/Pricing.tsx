"use client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

const plans = [
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
    name: "Studio",
    price: "1,299",
    description: "For teams and power users",
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

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black tracking-tight">
            Simple pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative"
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black text-white text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <Zap className="w-4 h-4" />
                  Most popular
                </div>
              )}

              <div
                className={`relative h-full p-8 rounded-3xl bg-white border transition-all duration-300 ${
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

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-black">₹{plan.price}</span>
                    <span className="text-gray-500">/month</span>
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
      </div>
    </section>
  );
}
