'use client';

import React from 'react';
import { Crown, Zap } from 'lucide-react';

const SubscriptionBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-700 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <div className="text-white font-semibold">Free Access</div>
            <div className="text-slate-400 text-sm">
              CSA content available - AI features require Pro upgrade
            </div>
          </div>
        </div>
        <button
          onClick={() => window.open('https://buy.stripe.com/5kQeVefxX2VmbCS0tO7ok05', '_blank')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>Upgrade to Pro</span>
        </button>
      </div>

      <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-400 mt-0.5">⚡</div>
          <div>
            <div className="text-blue-200 font-medium text-sm">Unlock AI-Powered Learning</div>
            <div className="text-blue-300 text-sm mt-1">
              Get unlimited AI explanations, personalized tutoring, and advanced study features.
              Complete CSA training with intelligent assistance - upgrade to Pro for just $9.99/month.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;