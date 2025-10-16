'use client';

import React, { useState } from 'react';
import TutorSelection from '@/components/tutor/TutorSelection';
import ChatInterface from '@/components/chat/ChatInterface';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import PWASuccessPrompt from '@/components/pwa/PWASuccessPrompt';
import { CertificationLevel } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'selection' | 'chat'>('selection');
  const [selectedLevel, setSelectedLevel] = useState<CertificationLevel | ''>('');

  const handleTutorSelection = (level: CertificationLevel) => {
    setSelectedLevel(level);
    setCurrentView('chat');
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedLevel('');
  };

  return (
    <>
      {/* PWA Success Prompt for new subscribers */}
      <PWASuccessPrompt />

      {currentView === 'selection' && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <PWAInstallPrompt />
        </div>
      )}
      {currentView === 'selection' ? (
        <TutorSelection onSelectLevel={handleTutorSelection} />
      ) : (
        <ChatInterface
          selectedLevel={selectedLevel as CertificationLevel}
          onBack={handleBackToSelection}
        />
      )}
    </>
  );
}