import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Palette, ShoppingBag, Building2, Loader2, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

interface RegisterPageProps {
  onNavigate: (view: AppView) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profession: '', // Sera utilisé comme "Nom du Business" pour les boutiques
    phone: '',
    archetype: 'creative' // Par défaut
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gestion des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sélection de l'Archétype
  const selectArchetype = (type: string) => {
    setFormData({ ...formData, archetype: type });
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. NETTOYAGE DU NUMÉRO (Source Unique)
      let cleanPhone = formData.phone.replace(/[^0-9]/g, ''); // Enlève tout sauf les chiffres
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1); // Enlève le 0 au début
      if (!cleanPhone.startsWith('243')) cleanPhone = '243' + cleanPhone; // Ajoute 243 si absent

      // 2. CRÉATION AUTHENTIFICATION
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. ENREGISTREMENT BASE DE DONNÉES (Avec Archétype)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        profession: formData.profession,
        phone: cleanPhone, // Numéro corrigé (Source Unique)
        archetype: formData.archetype, // Le choix (creative, business, institution)
        createdAt: serverTimestamp(),
        plan: 'free',
        isVerified: false,
        portfolioSlug: '' // Pas de slug au début
      });

      // 4. REDIRECTION VERS LE STUDIO
      onNavigate(AppView.WIZARD);

    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Cet email est déjà utilisé par un autre compte. Veuillez vous connecter ou utiliser un autre email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("L'adresse email est mal formatée. Veuillez vérifier votre saisie.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue lors de l'inscription. Veuillez vérifier votre connexion et réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 selection:bg-[#FFD700] selection:text-black font-sans">
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        
        {/* COLONNE GAUCHE : INFO & VISUEL */}
        <div className="p-10 flex flex-col justify-center relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gold-500/5"></div>
            <div className="relative z-10">
                <h1 className="text-3xl font-black mb-2 tracking-tighter">
                    MY<span className="text-[#FFD700]">FOLIO</span> V27
                </h1>
                <p className="text-gray-400 mb-8 text-sm">
                    Rejoignez l'élite digitale de Kinshasa. Créez votre vitrine professionnelle en 2 minutes.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#FFD700] border border-white/10"><Palette size={14}/></div>
                        <div>
                            <strong className="text-white block">Pour les Créatifs</strong>
                            Portfolio, Galerie, Booking
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#FFD700] border border-white/10"><ShoppingBag size={14}/></div>
                        <div>
                            <strong className="text-white block">Pour le Business</strong>
                            Produits, Prix, Commandes WhatsApp
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#FFD700] border border-white/10"><Building2 size={14}/></div>
                        <div>
                            <strong className="text-white block">Pour les Institutions</strong>
                            Hôpitaux, Églises, Services, Horaires
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE */}
        <div className="p-10 bg-[#0e0e0e]">
            <h2 className="text-xl font-bold mb-6 text-white">Créer un compte</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. SÉLECTEUR D'ARCHÉTYPE (VISUEL) */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <button type="button" onClick={() => selectArchetype('creative')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${formData.archetype === 'creative' ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}>
                        <Palette size={20} />
                        <span className="text-[10px] font-bold uppercase">Créatif</span>
                    </button>
                    <button type="button" onClick={() => selectArchetype('business')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${formData.archetype === 'business' ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}>
                        <ShoppingBag size={20} />
                        <span className="text-[10px] font-bold uppercase">Vente</span>
                    </button>
                    <button type="button" onClick={() => selectArchetype('institution')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${formData.archetype === 'institution' ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}>
                        <Building2 size={20} />
                        <span className="text-[10px] font-bold uppercase">Service</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Nom complet / Marque</label>
                        <input type="text" name="name" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FFD700] outline-none transition text-white" placeholder="Ex: Dr. Kabeya" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Activité / Titre</label>
                        <input type="text" name="profession" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FFD700] outline-none transition text-white" placeholder="Ex: Pédiatrie Générale" onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Numéro de Téléphone (WhatsApp)</label>
                    <input type="tel" name="phone" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FFD700] outline-none transition text-white" placeholder="Ex: 081 234 56 78" onChange={handleChange} />
                    <p className="text-[10px] text-gray-600 mt-1">Sera utilisé pour les appels, rendez-vous et commandes.</p>
                </div>

                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email</label>
                    <input type="email" name="email" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FFD700] outline-none transition text-white" placeholder="contact@hopital.com" onChange={handleChange} />
                </div>

                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Mot de passe</label>
                    <input type="password" name="password" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FFD700] outline-none transition text-white" placeholder="••••••••" onChange={handleChange} />
                </div>

                {error && <p className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#FDB931] text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-gold-500/20 disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" /> : <>ACCÉDER AU STUDIO <ArrowRight size={18}/></>}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                    Déjà membre ? <button onClick={() => onNavigate(AppView.LOGIN)} className="text-[#FFD700] hover:underline">Connexion</button>
                </p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;