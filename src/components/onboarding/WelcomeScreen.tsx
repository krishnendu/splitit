import React from 'react';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to SplitIt</h1>
      <p className="text-xl text-gray-600 mb-8">
        Split expenses easily with friends and family. No backend required - your data stays in your Google Sheet.
      </p>
      <div className="space-y-4 text-left bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-start">
          <span className="text-2xl mr-3">📊</span>
          <div>
            <h3 className="font-semibold">Your Data, Your Control</h3>
            <p className="text-gray-600">All data is stored in your own Google Sheet</p>
          </div>
        </div>
        <div className="flex items-start">
          <span className="text-2xl mr-3">🔒</span>
          <div>
            <h3 className="font-semibold">Privacy First</h3>
            <p className="text-gray-600">No backend servers, no data collection</p>
          </div>
        </div>
        <div className="flex items-start">
          <span className="text-2xl mr-3">💰</span>
          <div>
            <h3 className="font-semibold">Free Forever</h3>
            <p className="text-gray-600">Zero hosting costs, works entirely client-side</p>
          </div>
        </div>
      </div>
    </div>
  );
};
