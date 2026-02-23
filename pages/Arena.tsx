import React from 'react';
import { AppView, CreatorProfile } from '../types';

interface ArenaProps {
  onSelectCreator: (creator: CreatorProfile) => void;
  onNavigate: (view: AppView) => void;
}

const ArenaPage: React.FC<ArenaProps> = ({ onSelectCreator, onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Arena Page (Placeholder)</p>
      <button onClick={() => onNavigate(AppView.LANDING)}>Go to Landing</button>
    </div>
  );
};

export default ArenaPage;
