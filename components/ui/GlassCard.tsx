import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
      relative overflow-hidden
      bg-glass-light backdrop-blur-md 
      border border-glass-border 
      rounded-2xl shadow-glass
      text-white
      ${className}
    `}>
      {/* Petit effet de reflet en haut à gauche pour le côté "brillant" */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;