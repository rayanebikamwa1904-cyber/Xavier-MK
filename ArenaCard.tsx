import React from 'react';
import { Star, MessageCircle, MapPin, ShieldCheck, Eye, Share } from 'lucide-react';
import { CreatorProfile } from '../types';

interface ArenaCardProps {
  provider: CreatorProfile;
  onClick: () => void;
  onReviewClick: () => void;
  onTagClick: (tag: string) => void;
}

const ArenaCard: React.FC<ArenaCardProps> = ({ provider, onClick, onReviewClick, onTagClick }) => {
  // Mapping data safely
  const hero = provider?.portfolio?.sections?.find(s => s.type === 'hero')?.content || {};
  const bio = provider?.portfolio?.sections?.find(s => s.type === 'bio')?.content || {};
  const contact = provider?.portfolio?.sections?.find(s => s.type === 'contact')?.content || {};
  const social = provider?.portfolio?.sections?.find(s => s.type === 'social')?.content || {};

  const flatProvider = {
    name: provider?.name || "Prestataire",
    profession: provider?.category || "Créatif",
    location: provider?.location?.commune || contact?.address?.split(',')[0] || "Kinshasa",
    rating: provider?.rating || 5,
    reviews: provider?.reviewCount || 0,
    isVerified: provider?.verified || false,
    coverImage: hero?.backgroundImage || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
    avatar: bio?.image || social?.userAvatar || "https://via.placeholder.com/100",
    phone: provider?.phone || ""
  };
  
  const getWhatsAppUrl = (phone: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '243' + clean.substring(1);
    else if (!clean.startsWith('243') && clean.length === 9) clean = '243' + clean;
    return `https://wa.me/${clean}?text=${encodeURIComponent("Bonjour ! Je vous contacte depuis l'Arène My Folio-Tag.")}`;
  };

  const whatsappUrl = flatProvider.phone ? getWhatsAppUrl(flatProvider.phone) : '#';

const handleShare = async (e) => {
e.stopPropagation();
const shareUrl = window.location.origin + '/?p=' + provider.id;
if (navigator.share) {
try {
await navigator.share({ title: provider.name, url: shareUrl });
} catch (err) {
if (err.name !== 'AbortError') console.error(err);
}
} else {
try {
await navigator.clipboard.writeText(shareUrl);
alert('Lien du portfolio copié !');
} catch (err) {
console.error('Erreur de copie', err);
}
}
};

  return (
    <div className="group relative w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-[#FFD700]/50 hover:shadow-[0_0_50px_rgba(255,215,0,0.15)] flex flex-col h-[420px]">
      
      {/* --- 1. COVER HERO (Parallax Effect) --- */}
      <div className="h-40 relative overflow-hidden shrink-0">
        <img 
            src={flatProvider.coverImage} 
            alt={flatProvider.name} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        
        {/* Badge VÉRIFIÉ (Gold) */}
        {flatProvider.isVerified && (
            <div className="absolute top-3 right-3 bg-[#FFD700] text-black text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20 tracking-widest uppercase border border-white/20">
                <ShieldCheck size={12} strokeWidth={3} /> Certifié
            </div>
        )}
      </div>

      {/* --- 2. IDENTITY (Avatar overlap) --- */}
      <div className="px-6 relative flex-1 flex flex-col">
        
        {/* AVATAR GLAMOUR */}
        <div className="absolute -top-12 left-6">
            <div className="relative group/avatar">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD700] to-[#FDB931] rounded-full opacity-75 blur group-hover/avatar:opacity-100 transition duration-500"></div>
                <div className="relative w-24 h-24 rounded-full p-0.5 bg-black">
                    <img 
                        src={flatProvider.avatar} 
                        className="w-full h-full rounded-full object-cover" 
                        alt="Avatar"
                    />
                </div>
            </div>
        </div>

        {/* INFO TEXTE */}
        <div className="pt-14 mb-4">
            <h3 className="text-2xl font-black text-white mb-1 font-serif tracking-tight truncate group-hover:text-[#FFD700] transition-colors">
                {flatProvider.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wide">
                <span className="text-[#FFD700] font-bold">{flatProvider.profession}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {flatProvider.location}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {provider?.tags?.map((tag, index) => (
                    <button key={index} onClick={() => onTagClick(tag)} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded hover:bg-gold-400 hover:text-black transition">
                        #{tag}
                    </button>
                ))}
            </div>
        </div>

        {/* --- 3. ACTION BAR (Bottom) --- */}
        <div className="mt-auto pb-6 grid grid-cols-4 gap-2">
            
            {/* WhatsApp */}
            {flatProvider.phone ? (
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-[#white]/5 border border-white/10 text-white hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all group/btn"
                >
                    <MessageCircle size={18} className="text-gray-300 group-hover/btn:text-white"/>
                    <span className="text-[9px] font-black uppercase tracking-wider">Discuter</span>
                </a>
            ) : (
                <div className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-700 cursor-not-allowed opacity-50">
                    <MessageCircle size={18} />
                    <span className="text-[9px] font-black uppercase tracking-wider">N/A</span>
                </div>
            )}

            {/* Share Button */}
            <button 
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black hover:border-white transition-all group/btn"
            >
                <Share size={16} className="text-gray-300 group-hover/btn:text-black"/>
                <span className="text-[9px] font-black uppercase tracking-wider">Partager</span>
            </button>

            {/* Avis */}
            <button 
                onClick={(e) => { e.stopPropagation(); onReviewClick(); }}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black hover:border-white transition-all group/btn"
            >
                <div className="flex items-center gap-1">
                    <Star size={12} className="fill-[#FFD700] text-[#FFD700]"/>
                    <span className="text-xs font-bold">{flatProvider.rating}</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider">{flatProvider.reviews} Avis</span>
            </button>

            {/* Portfolio */}
            <button 
                onClick={onClick}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-[#FFD700] text-black border border-[#FFD700] hover:bg-[#FDB931] hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
                <Eye size={18} strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-wider">Voir Site</span>
            </button>

        </div>
      </div>
    </div>
  );
};

export default ArenaCard;