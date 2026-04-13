import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-amber-900/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">✓ InterviewPrep</h3>
            <p className="text-gray-400 text-sm">
              Master your next interview with real experts.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition">Features</a></li>
              <li><a href="#" className="hover:text-amber-400 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-amber-400 transition">Browse Experts</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition">About</a></li>
              <li><a href="#" className="hover:text-amber-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-amber-400 transition">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition">Privacy</a></li>
              <li><a href="#" className="hover:text-amber-400 transition">Terms</a></li>
              <li><a href="#" className="hover:text-amber-400 transition">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-amber-900/20 pt-8">
          <p className="text-center text-gray-500 text-sm">
            Made with ❤️ by InterviewPrep • {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
