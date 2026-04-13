import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-black border-t border-amber-900/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Your next interview<br />
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            starts here
          </span>
        </h2>

        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of engineers already leveling up on our platform
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            Get Started
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="border-2 border-gray-600 hover:border-amber-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Browse Interviewers
          </button>
        </div>
      </div>
    </section>
  );
}
