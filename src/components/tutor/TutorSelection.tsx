'use client';

import React from 'react';
import { Wrench, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { CertificationLevel } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';

interface TutorSelectionProps {
  onSelectLevel: (level: CertificationLevel) => void;
}

const TutorSelection: React.FC<TutorSelectionProps> = ({ onSelectLevel }) => {
  const { mode } = useSubscription();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <Wrench className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Gas Technician Tutor</h1>
          </div>
          <p className="text-slate-300 text-sm font-medium">CSA B149.1-25 & B149.2-25 Certified Training</p>
          <div className="flex items-center justify-center mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="16"
              viewBox="0 0 24 16"
              className="w-6 h-4 mr-2"
              aria-label="Canada Flag"
            >
              <rect width="24" height="16" fill="#FF0000"/>
              <path d="M12 8L6 4v8l6-4z" fill="#FFFFFF"/>
            </svg>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Canadian Standards</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Subscription Banner */}
          <SubscriptionBanner />
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2 tracking-wide">Select Your Certification Level</h2>
            <p className="text-slate-400 text-sm font-normal">Choose your gas technician certification path</p>
          </div>

          {/* G3 Button */}
          <button
            onClick={() => onSelectLevel('G3')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl border border-blue-500/20"
            aria-label="Select G3 Gas Technician certification path"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold tracking-wide">G3 Technician</div>
                  <div className="text-blue-200 text-sm font-medium">Basic Gas Installation</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-200 tracking-wider">G3</div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-500/20 text-xs text-blue-200 font-normal">
              Natural gas appliances up to 400,000 BTU/hr
            </div>
          </button>

          {/* G2 Button */}
          <button
            onClick={() => onSelectLevel('G2')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl border border-red-500/20"
            aria-label="Select G2 Gas Technician certification path"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                  <Wrench className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold tracking-wide">G2 Technician</div>
                  <div className="text-red-200 text-sm font-medium">Advanced Gas Systems</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-200 tracking-wider">G2</div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-500/20 text-xs text-red-200 font-normal">
              All gas appliances & complex installations
            </div>
          </button>

          {/* LARK Labs Branding */}
          <div className="text-center mt-8">
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Powered by</div>
            <div className="text-slate-300 text-lg font-bold tracking-wide">LARK Labs</div>
            <div className="text-slate-400 text-xs font-normal">Educational Excellence in HVAC Technology</div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-800/30 px-4 py-4">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              CSA Certified
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
              Safety First
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSelection;