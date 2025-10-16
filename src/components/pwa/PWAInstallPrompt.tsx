'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onDismiss, className = '' }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');

  useEffect(() => {
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
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after a delay if not already installed
    const timer = setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
      }
    }, 5000); // Show after 5 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
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
    // Remember dismissal for this session (client-side only)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't show if already dismissed this session (client-side only)
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  // Don't show if already installed (running in standalone mode) (client-side only)
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Install Your Professional App</span>
            </div>
            <div className="text-sm text-slate-300">
              <p className="mb-2">Get the full app experience:</p>
              <ol className="space-y-1 text-xs">
                <li>1. Tap the <strong>Share</strong> button</li>
                <li>2. Select <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
                <li>3. Tap <strong>&ldquo;Add&rdquo;</strong> to install</li>
              </ol>
            </div>
            <div className="text-xs text-blue-300">
              Works offline • Faster loading • Native app feel
            </div>
          </div>
        );

      case 'android':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Install Your Professional App</span>
            </div>
            <div className="text-sm text-slate-300">
              <p className="mb-2">Get the full app experience:</p>
              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Install App</span>
                </button>
              ) : (
                <ol className="space-y-1 text-xs">
                  <li>1. Tap the <strong>Menu</strong> (⋮) button</li>
                  <li>2. Select <strong>&ldquo;Add to Home screen&rdquo;</strong></li>
                  <li>3. Tap <strong>&ldquo;Add&rdquo;</strong> to install</li>
                </ol>
              )}
            </div>
            <div className="text-xs text-blue-300">
              Works offline • Faster loading • Native app feel
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Install Desktop App</span>
            </div>
            <div className="text-sm text-slate-300">
              <p className="mb-2">Get the professional desktop experience:</p>
              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Install App</span>
                </button>
              ) : (
                <div className="text-xs">
                  Look for the install icon in your browser&apos;s address bar
                </div>
              )}
            </div>
            <div className="text-xs text-blue-300">
              Dedicated app window • Quick access • Better performance
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 ${className}`}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-slate-700/50 rounded-full transition-colors"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4 text-slate-400" />
      </button>

      {renderInstructions()}
    </div>
  );
};

export default PWAInstallPrompt;