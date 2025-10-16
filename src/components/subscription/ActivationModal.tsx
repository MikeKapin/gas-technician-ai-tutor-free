'use client';

import React, { useState } from 'react';
import { X, GraduationCap, Check, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { activateStudentCode } = useSubscription();

  if (!isOpen) return null;

  const handleActivate = () => {
    setError('');
    setSuccess(false);

    if (code.length !== 8) {
      setError('Access code must be 8 characters (e.g., LARK0001)');
      return;
    }

    const result = activateStudentCode(code);

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        window.location.reload(); // Reload to apply new subscription mode
      }, 2000);
    } else {
      setError('Invalid LARK Labs access code. Please check your code and try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleActivate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <GraduationCap className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Activate Student Access</h2>
              <p className="text-sm text-slate-400">Enter your LARK Labs access code</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-400 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-200">
                <strong>LARK Labs Students:</strong> Enter your 8-character access code
                (e.g., LARK0001) to unlock 12 months of full AI tutor features.
              </div>
            </div>
          </div>

          {/* Input */}
          <div>
            <label htmlFor="activation-code" className="block text-sm font-medium text-slate-300 mb-2">
              Access Code
            </label>
            <input
              id="activation-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="LARK####"
              maxLength={8}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-lg tracking-wider text-center"
              disabled={success}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start space-x-2">
              <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-200">
                ✅ Access activated! Redirecting...
              </p>
            </div>
          )}

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={code.length !== 8 || success}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
              code.length === 8 && !success
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {success ? 'Activated!' : 'Activate Student Access'}
          </button>

          {/* Info Footer */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Access codes are provided by your instructor. Each code grants 12 months
              of unlimited AI tutoring features. After expiration, the app automatically
              reverts to free mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationModal;
