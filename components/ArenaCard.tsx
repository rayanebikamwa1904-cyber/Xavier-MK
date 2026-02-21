const ArenaCard: React.FC<ArenaCardProps> = ({ provider, onClick, onReviewClick, onTagClick }) => {
  // Mapping data safely
  const hero = provider.portfolio.sections.find(s => s.type === 'hero')?.content || {};
  const bio = provider.portfolio.sections.find(s => s.type === 'bio')?.content || {};
  const contact = provider.portfolio.sections.find(s => s.type === 'contact')?.content || {};
  const social = provider.portfolio.sections.find(s => s.type === 'social')?.content || {};

  const flatProvider = {
    name: provider.name,
    profession: provider.category || "Créatif",
    location: provider.location?.commune || contact.address?.split(',')[0] || "Kinshasa",
    rating: provider.rating,
    reviews: provider.reviewCount,
    isVerified: provider.verified,
    // On enlève le ! pour laisser le thème parent respirer
    coverImage: hero.backgroundImage || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
    avatar: bio.image || social.userAvatar || "https://via.placeholder.com/100",
    phone: provider.phone
  };
  
  // ... (Garde ta fonction getWhatsAppUrl telle quelle)

  return (
    // J'ai enlevé les "!" inutiles pour éviter le flash blanc au chargement
    <div className="group relative w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-gold-400/50 hover:shadow-2xl flex flex-col h-[420px]">
      
      {/* 1. COVER HERO */}
      <div className="h-40 relative overflow-hidden shrink-0">
        <img 
            src={flatProvider.coverImage} 
            alt={flatProvider.name} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        {flatProvider.isVerified && (
            <div className="absolute top-3 right-3 bg-gold-400 text-black text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20 uppercase">
                <ShieldCheck size={12} strokeWidth={3} /> Certifié
            </div>
        )}
      </div>

      {/* 2. IDENTITY */}
      <div className="px-6 relative flex-1 flex flex-col">
        <div className="absolute -top-10 left-6">
            <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gold-400 to-yellow-600">
                <img 
                    src={flatProvider.avatar} 
                    className="w-full h-full rounded-full object-cover border-2 border-black" 
                    alt="Avatar"
                />
            </div>
        </div>

        <div className="pt-12 mb-4">
            <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-gold-400 transition-colors">
                {flatProvider.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest">
                <span className="text-gold-400 font-bold">{flatProvider.profession}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {flatProvider.location}</span>
            </div>
        </div>

        {/* 3. ACTION BAR */}
        <div className="mt-auto pb-6 grid grid-cols-3 gap-2">
            
            {/* WhatsApp */}
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-green-600 transition-all">
                <MessageCircle size={18} />
                <span className="text-[8px] font-bold uppercase">Discuter</span>
            </a>

            {/* Avis */}
            <button onClick={(e) => { e.stopPropagation(); onReviewClick(); }} className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all">
                <div className="flex items-center gap-1">
                    <Star size={10} className="fill-gold-400 text-gold-400"/>
                    <span className="text-xs font-bold">{flatProvider.rating}</span>
                </div>
                <span className="text-[8px] font-bold uppercase">{flatProvider.reviews} Avis</span>
            </button>

            {/* Portfolio - C'est ici qu'on va rediriger vers l'ID unique */}
            <button 
                onClick={onClick}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-gold-400 text-black font-bold hover:scale-105 transition-all"
            >
                <Eye size={18} />
                <span className="text-[8px] font-black uppercase">Voir Site</span>
            </button>
        </div>
      </div>
    </div>
  );
};
