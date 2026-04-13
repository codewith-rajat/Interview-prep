import React from 'react';
import PricingCard from '../cards/PricingCard';

export default function PricingSection() {
  const plans = [
    {
      plan: 'Free',
      price: 0,
      credits: 1,
      features: [
        '1 mock interview session',
        'HD video call via Stream',
        'Persistent chat thread'
      ]
    },
    {
      plan: 'Starter',
      price: 29,
      credits: 5,
      features: [
        '5 mock interview sessions',
        'AI feedback report',
        'HD video call via Stream',
        'Persistent chat thread',
        'Credits roll over monthly'
      ],
      isPopular: true
    },
    {
      plan: 'Pro',
      price: 69,
      credits: 15,
      features: [
        '15 mock interview sessions',
        'AI feedback report',
        'HD video call via Stream',
        'Persistent chat thread',
        'Credits roll over monthly',
        'Recording & playback link'
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-black border-t border-amber-900/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Simple, transparent{' '}
            <span className="text-gray-400">credit-based plans</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Each credit = one session. Unused credits roll over.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
