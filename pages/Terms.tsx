import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppView } from '../types';

interface TermsPageProps {
  onNavigate: (view: AppView) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="relative max-w-4xl mx-auto p-8">
        <button 
          onClick={() => onNavigate(AppView.LANDING)}
          className="absolute top-8 left-8 p-2 text-white/50 hover:text-white transition z-50 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="pt-20">
          <h1 className="text-4xl font-bold text-gold-400 mb-8">Conditions Générales d'Utilisation</h1>
          <div className="prose prose-invert prose-lg text-gray-300">
            <p>Date de dernière mise à jour : 20 Février 2026</p>
            
            <h2>1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme My Folio-Tag, qui permet aux créatifs et entrepreneurs de créer et de gérer un portfolio en ligne.</p>

            <h2>2. Services et Abonnements</h2>
            <p>My Folio-Tag propose des abonnements payants pour accéder à ses services. Les tarifs et les fonctionnalités sont détaillés sur notre page de tarification.</p>

            <h2>3. Politique de Remboursement</h2>
            <p className="font-bold text-gold-400 border-l-4 border-gold-400 pl-4">Tout abonnement ou service est non remboursable après un délai de 24 heures suivant l'activation. Aucune exception ne sera faite.</p>

            <h2>4. Responsabilité</h2>
            <p>L'utilisateur est seul responsable du contenu qu'il publie sur son portfolio. My Folio-Tag ne pourra être tenu responsable des contenus illicites ou préjudiciables publiés par ses utilisateurs.</p>

            <h2>5. Modification des CGU</h2>
            <p>My Folio-Tag se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par email ou via une notification sur la plateforme.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
