'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, CheckCircle, Crown } from 'lucide-react';

interface PWASuccessPromptProps {
  onDismiss?: () => void;
  className?: string;
}

const PWASuccessPrompt: React.FC<PWASuccessPromptProps> = ({ onDismiss, className = '' }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // Only show if payment success flag is set
    const showFlag = sessionStorage.getItem('show-pwa-success');
    if (showFlag === 'true') {
      // Clear the flag
      sessionStorage.removeItem('show-pwa-success');

      // Detect platform
      const userAgent = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        setPlatform('ios');
      } else if (/Android/.test(userAgent)) {
        setPlatform('android');
      } else {
        setPlatform('desktop');
      }

      // Listen for beforeinstallprompt event (Chrome/Edge)
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Show prompt after a brief delay
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowPrompt(true);
        }
      }, 2000);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  // Don't show if already installed
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  const renderInstructions = () => {
    switch (platform) {
      case 'ios':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Welcome to AI Tutor Pro!</h3>
                <p className="text-green-300 text-sm">Payment successful • Full access activated</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Smartphone className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-white">Install Your Professional App</span>
              </div>
              <div className="text-sm text-slate-300">
                <p className="mb-3">Get the complete Pro experience:</p>
                <ol className="space-y-2 text-xs">
                  <li className="flex items-start">
                    <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button at the bottom</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                    <span>Select <strong>&ldquo;Add to Home Screen&rdquo;</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                    <span>Tap <strong>&ldquo;Add&rdquo;</strong> to install</span>
                  </li>
                </ol>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                <span className="text-blue-300 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Features
                </span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-300">Works Offline</span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-300">Fast Loading</span>
              </div>
            </div>
          </div>
        );

      case 'android':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Welcome to AI Tutor Pro!</h3>
                <p className="text-green-300 text-sm">Payment successful • Full access activated</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Smartphone className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-white">Install Your Professional App</span>
              </div>
              <div className="text-sm text-slate-300">
                <p className="mb-3">Get the complete Pro experience:</p>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2 mb-3"
                  >
                    <Download className="h-5 w-5" />
                    <span>Install Pro App Now</span>
                  </button>
                ) : (
                  <ol className="space-y-2 text-xs mb-3">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>Tap the <strong>Menu</strong> (⋮) button</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Select <strong>&ldquo;Add to Home screen&rdquo;</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>Tap <strong>&ldquo;Add&rdquo;</strong> to install</span>
                    </li>
                  </ol>
                )}
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <span className="text-blue-300 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Features
                </span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-300">Works Offline</span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-300">Fast Loading</span>
              </div>
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Welcome to AI Tutor Pro!</h3>
                <p className="text-green-300 text-sm">Payment successful • Full access activated</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Monitor className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-white">Install Desktop Pro App</span>
              </div>
              <div className="text-sm text-slate-300">
                <p className="mb-3">Get the professional desktop experience:</p>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2 mb-3"
                  >
                    <Download className="h-5 w-5" />
                    <span>Install Pro App Now</span>
                  </button>
                ) : (
                  <div className="text-xs mb-3 text-center p-2 bg-slate-700/30 rounded">
                    Look for the install icon in your browser&apos;s address bar
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <span className="text-blue-300 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Features
                </span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-300">Dedicated Window</span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-300">Quick Access</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-2xl p-6 max-w-md w-full shadow-2xl ${className}`}>
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-full transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>

        {renderInstructions()}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWASuccessPrompt;