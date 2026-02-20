import React from 'react';

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const GoldButton: React.FC<GoldButtonProps> = ({ children, onClick, className = "" }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        relative px-8 py-3 rounded-full font-bold text-black
        bg-gold-shine bg-[length:200%_auto] hover:bg-right transition-all duration-500
        shadow-glow hover:shadow-[0_0_25px_rgba(250,204,21,0.7)]
        transform hover:-translate-y-1
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default GoldButton;