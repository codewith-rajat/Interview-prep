import React from 'react';
import { Check } from 'lucide-react';

export default function PricingCard({ plan, price, credits, features, isPopular }) {
  return (
    <div
      className={`relative rounded-lg border transition-all ${
        isPopular
          ? 'border-amber-500 bg-gradient-to-br from-[#0f0f11] to-black shadow-2xl shadow-amber-500/20 scale-105'
          : 'border-gray-700 bg-gradient-to-br from-[#0f0f11] to-black hover:border-amber-500/30'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-amber-500 text-black font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-8">
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wider">
          {plan}
        </h3>

        {/* Price */}
        <div className="mb-6">
          <span className="text-5xl font-bold text-white">${price}</span>
          <span className="text-gray-400 ml-2">/month</span>
        </div>

        {/* Credits Highlight */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
          <p className="text-amber-400 font-bold">
            {credits} credits / month
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Each credit = 1 session
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          className={`w-full py-3 rounded-lg font-bold transition-colors ${
            isPopular
              ? 'bg-amber-500 hover:bg-amber-600 text-black'
              : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
          }`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
