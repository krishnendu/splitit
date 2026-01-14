import React, { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { SheetSetup } from './SheetSetup';
import { BackupSetup } from './BackupSetup';
import { useNavigate } from 'react-router-dom';

type Step = 'welcome' | 'sheet' | 'backup' | 'complete';

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const navigate = useNavigate();

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('sheet');
        break;
      case 'sheet':
        setCurrentStep('backup');
        break;
      case 'backup':
        setCurrentStep('complete');
        navigate('/');
        break;
    }
  };

  const handleSheetSetupComplete = () => {
    setCurrentStep('backup');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        {currentStep === 'welcome' && (
          <div>
            <WelcomeScreen onNext={handleNext} />
            <div className="text-center mt-8">
              <button onClick={handleNext} className="btn btn-primary">
                Get Started
              </button>
            </div>
          </div>
        )}

        {currentStep === 'sheet' && (
          <div>
            <SheetSetup onComplete={handleSheetSetupComplete} />
          </div>
        )}

        {currentStep === 'backup' && (
          <div>
            <BackupSetup onComplete={handleNext} />
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${currentStep === 'welcome' ? 'bg-primary-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-2 rounded-full ${currentStep === 'sheet' ? 'bg-primary-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-2 rounded-full ${currentStep === 'backup' ? 'bg-primary-600' : 'bg-gray-300'}`} />
        </div>
      </div>
    </div>
  );
};
