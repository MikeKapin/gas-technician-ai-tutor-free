'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Sparkles, Crown, Zap, GraduationCap } from 'lucide-react';
import ActivationModal from './ActivationModal';

const SubscriptionBanner: React.FC = () => {
  const { mode, hasAIAccess, messagesUsed, messageLimit, daysRemaining, isExpiringSoon } = useSubscription();
  const [showActivationModal, setShowActivationModal] = useState(false);

  const stripePaymentUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL || 'https://buy.stripe.com/5kQeVefxX2VmbCS0tO7ok05';

  // Debug log to see what URL we're using
  console.log('Stripe Payment URL:', stripePaymentUrl);

  // Student mode banner
  if (mode === 'student') {
    return (
      <div>
        <div className={`bg-gradient-to-r rounded-lg p-4 mb-4 ${
          isExpiringSoon
            ? 'from-orange-600/20 to-red-600/20 border border-orange-500/30'
            : 'from-orange-600/20 to-yellow-600/20 border border-orange-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-6 w-6 text-orange-400" />
              <div>
                <div className="text-white font-semibold">LARK Labs Student Access</div>
                <div className={`text-sm ${isExpiringSoon ? 'text-orange-200' : 'text-orange-200'}`}>
                  {daysRemaining === 1
                    ? 'Expires in 1 day'
                    : `${daysRemaining} days remaining`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-orange-400" />
              <span className="text-orange-400 font-medium">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Expiration reminder for last 5 days */}
        {isExpiringSoon && (
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-700 p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-white font-semibold">Student Access Expiring Soon</div>
                  <div className="text-blue-200 text-sm">
                    After expiration, app will revert to free mode with all CSA content available
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'pro') {
    return (
      <div>
        <div className={`bg-gradient-to-r rounded-lg p-4 mb-4 ${
          isExpiringSoon
            ? 'from-orange-600/20 to-red-600/20 border border-orange-500/30'
            : 'from-blue-600/20 to-purple-600/20 border border-blue-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-yellow-400" />
              <div>
                <div className="text-white font-semibold">AI Tutor Pro</div>
                <div className={`text-sm ${isExpiringSoon ? 'text-orange-200' : 'text-blue-200'}`}>
                  {daysRemaining === 1
                    ? 'Expires in 1 day'
                    : `${daysRemaining} days remaining`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Renewal reminder for last 5 days */}
        {isExpiringSoon && (
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-700 p-2 rounded-lg">
                  <Crown className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <div className="text-white font-semibold">Extend Your Pro Access</div>
                  <div className="text-green-200 text-sm">
                    Continue unlimited AI tutoring for another 30 days
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open(stripePaymentUrl, '_blank')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Crown className="h-4 w-4" />
                <span>Extend 30 Days</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Free version banner
  return (
    <>
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-700 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <div className="text-white font-semibold">Free Access</div>
              <div className="text-slate-400 text-sm">
                {hasAIAccess ? (
                  <>AI Messages: {messagesUsed}/{messageLimit}</>
                ) : (
                  <>AI limit reached - CSA content still available</>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowActivationModal(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Unlock AI Tutor</span>
            </button>
            <button
              onClick={() => window.open(stripePaymentUrl, '_blank')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>

      {!hasAIAccess && (
        <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-orange-400 mt-0.5">⚡</div>
            <div>
              <div className="text-orange-200 font-medium text-sm">AI Features Temporarily Limited</div>
              <div className="text-orange-300 text-sm mt-1">
                You&apos;ve used your free AI messages for this session. All CSA training content remains available.
                <strong> Students:</strong> Use your LARK code to unlock 12 months of unlimited AI tutoring.
                <strong> Others:</strong> Upgrade to Pro for $9.99/month.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    <ActivationModal
      isOpen={showActivationModal}
      onClose={() => setShowActivationModal(false)}
    />
  </>
  );
};

export default SubscriptionBanner;