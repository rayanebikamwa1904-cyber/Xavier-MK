import React from 'react';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const GoldButton: React.FC<GoldButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-glow ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GoldButton;
