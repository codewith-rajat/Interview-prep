import React from 'react';

export default function SocialProofSection() {
  const companies = [
    { name: 'Amazon', emoji: '🟠' },
    { name: 'Google', emoji: '🔴' },
    { name: 'Meta', emoji: '💙' },
    { name: 'Microsoft', emoji: '🪟' },
    { name: 'Netflix', emoji: '❤️' },
    { name: 'Uber', emoji: '⬛' }
  ];

  return (
    <section className="py-20 px-4 bg-black border-t border-amber-900/20">
      <div className="max-w-6xl mx-auto">
        {/* Main Stat */}
        <div className="text-center mb-16">
          <p className="text-5xl md:text-6xl font-bold text-white mb-3">
            2,400+
          </p>
          <p className="text-2xl text-gray-400 mb-2">
            engineers cracked FAANG interviews
          </p>
          <p className="text-gray-500">via our platform</p>
        </div>

        {/* Company Section */}
        <div className="text-center">
          <p className="text-gray-500 text-sm font-semibold mb-8 uppercase tracking-wider">
            Interviewees landed roles at
          </p>

          {/* Company Logos */}
          <div className="flex flex-wrap justify-center gap-12 mb-12">
            {companies.map((company, i) => (
              <div
                key={i}
                className="text-5xl opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                title={company.name}
              >
                {company.emoji}
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-gradient-to-br from-[#0f0f11] to-black border border-amber-900/20 rounded-lg p-8 max-w-2xl mx-auto">
            <p className="text-gray-300 text-lg mb-4 italic">
              "The mock interviews on this platform were incredibly helpful. The interviewers were senior engineers who asked real questions and gave actionable feedback."
            </p>
            <p className="text-amber-400 font-semibold">
              Rajat Kumar • Landed at Google
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
