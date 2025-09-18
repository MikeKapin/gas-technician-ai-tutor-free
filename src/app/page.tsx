'use client';

import React, { useState } from 'react';
import TutorSelection from '@/components/tutor/TutorSelection';
import ChatInterface from '@/components/chat/ChatInterface';
import { CertificationLevel } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'selection' | 'chat'>('selection');
  const [selectedLevel, setSelectedLevel] = useState<CertificationLevel | ''>('');

  const handleSelectLevel = (level: CertificationLevel) => {
    setSelectedLevel(level);
    setCurrentView('chat');
  };

  const handleBack = () => {
    setCurrentView('selection');
    setSelectedLevel('');
  };

  return (
    <main>
      {currentView === 'selection' ? (
        <TutorSelection onSelectLevel={handleSelectLevel} />
      ) : (
        <ChatInterface
          selectedLevel={selectedLevel as CertificationLevel}
          onBack={handleBack}
        />
      )}
    </main>
  );
}