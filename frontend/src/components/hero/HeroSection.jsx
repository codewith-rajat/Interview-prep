import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Ace your next </span>
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            interview
          </span>
          <br />
          <span className="text-white">with real experts</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
          Book 1:1 mock interviews with senior engineers from top companies. 
          Get AI-powered feedback, role-specific questions, and the confidence to land your dream job.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate('/role-selection')}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 px-10 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 text-lg"
          >
            Get Started
            <ArrowRight size={24} />
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="border-2 border-gray-600 hover:border-amber-500 text-white font-bold py-4 px-10 rounded-lg transition-colors text-lg"
          >
            Browse Interviewers
          </button>
        </div>

        {/* Social Proof */}
        <div className="space-y-4">
          {/* User Avatars */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-black flex items-center justify-center text-white font-bold text-xs"
                >
                  👤
                </div>
              ))}
            </div>
            <span className="text-gray-400 text-sm">Join 2,400+ engineers</span>
          </div>

          {/* Stats */}
          <p className="text-gray-500 text-sm">
            who've already cracked FAANG interviews
          </p>
        </div>
      </div>
    </section>
  );
}
