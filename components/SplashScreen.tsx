import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full blur-2xl opacity-75 animate-pulse"></div>
        <div className="relative w-40 h-40 flex items-center justify-center bg-black rounded-full">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            MY<span className="text-gold-400">FOLIO</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
