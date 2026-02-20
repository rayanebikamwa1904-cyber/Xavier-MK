import React from 'react';
import { Check } from 'lucide-react';
import { PortfolioTheme } from '../types';

interface ModelSelectorProps {
  onSelect: (theme: PortfolioTheme) => void;
}

const MODELS = [
  {
    id: 'imperial',
    name: "L'Impérial",
    desc: "Majestueux, Doré, Sérif. Idéal pour le Luxe.",
    theme: { style: 'elegant', primaryColor: 'text-gold-400', font: 'font-serif', layout: 'imperial' },
    previewGradient: 'from-gray-900 to-black border-gold-500',
  },
  {
    id: 'minimal',
    name: "Le Minimaliste",
    desc: "Épuré, Noir & Blanc, Sans-Serif. Pour les Architectes.",
    theme: { style: 'modern', primaryColor: 'text-white', font: 'font-geo', layout: 'minimal' },
    previewGradient: 'from-gray-800 to-gray-900 border-gray-500',
  },
  {
    id: 'vibrant',
    name: "Le Visionnaire",
    desc: "Couleurs néons, Police Impact. Pour les DJ & Artistes.",
    theme: { style: 'tech', primaryColor: 'text-fuchsia-500', font: 'font-impact', layout: 'split' },
    previewGradient: 'from-fuchsia-900/20 to-black border-fuchsia-500',
  },
  {
    id: 'corporate',
    name: "L'Expert",
    desc: "Bleu profond, Rassurant. Pour les Consultants.",
    theme: { style: 'modern', primaryColor: 'text-blue-400', font: 'font-sans', layout: 'split' },
    previewGradient: 'from-blue-900/20 to-black border-blue-500',
  }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-2">J'ai conçu 4 visions pour vous.</h2>
        <p className="text-gray-400">Choisissez le style qui incarne le mieux votre marque.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl w-full">
        {MODELS.map((model, index) => (
          <button
            key={model.id}
            onClick={() => onSelect(model.theme as PortfolioTheme)}
            className={`
                group relative h-96 rounded-2xl border bg-gradient-to-br ${model.previewGradient}
                hover:scale-105 transition-all duration-500 flex flex-col justify-end text-left overflow-hidden
                shadow-2xl
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Simulation visuelle abstraite du site */}
            <div className="absolute top-10 left-4 right-4 space-y-3 opacity-50 group-hover:opacity-100 transition duration-500">
                <div className={`h-4 w-1/2 rounded ${model.theme.primaryColor.replace('text', 'bg')}`}></div>
                <div className="h-2 w-full bg-white/20 rounded"></div>
                <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                <div className="mt-8 grid grid-cols-2 gap-2">
                    <div className="h-20 bg-white/10 rounded"></div>
                    <div className="h-20 bg-white/10 rounded"></div>
                </div>
            </div>

            {/* Info Bas de carte */}
            <div className="p-6 relative z-10 bg-black/50 backdrop-blur-md border-t border-white/10 w-full">
                <h3 className={`text-2xl font-bold text-white mb-1 ${model.theme.font}`}>{model.name}</h3>
                <p className="text-xs text-gray-300">{model.desc}</p>
                
                <div className="mt-4 flex items-center gap-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">
                    Choisir ce design <Check size={16} />
                </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;