import React from 'react';
import FeatureCard from '../cards/FeatureCard';

export default function FeaturesSection() {
  const features = [
    {
      icon: '🤖',
      title: 'AI Question Generator',
      description: 'Get role-specific questions tailored to your level — system design, behavioral, DSA.'
    },
    {
      icon: '💳',
      title: 'Credit System',
      description: 'Subscribe for monthly credits, book sessions, interviewers earn and withdraw anytime.'
    },
    {
      icon: '🎥',
      title: 'HD Video Calls',
      description: 'Powered by Stream. Screen sharing, recording, and instant playback links built in.'
    },
    {
      icon: '💬',
      title: 'Persistent Chat',
      description: 'Message before and after calls, share resources and prep notes in one thread.'
    },
    {
      icon: '🔒',
      title: 'Security',
      description: 'Bot protection, rate limiting, and abuse prevention in every API route.'
    },
    {
      icon: '📊',
      title: 'AI Feedback Reports',
      description: 'Post-interview analysis with actionable insights for improvement.'
    }
  ];

  return (
    <section className="py-20 px-4 bg-black border-t border-amber-900/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Everything you need,{' '}
            <span className="text-gray-400">nothing you don't</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            All the tools you need to ace your interviews with confidence
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
