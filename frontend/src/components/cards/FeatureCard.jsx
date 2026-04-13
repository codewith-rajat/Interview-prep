import React from 'react';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gradient-to-br from-[#0f0f11] to-black border border-amber-900/20 rounded-lg p-8 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/10">
      {/* Icon */}
      <div className="text-5xl mb-4">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
