import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Star, MessageSquare, Sparkles, User, LogIn, Send, MessageCircle, ShieldCheck, Megaphone, Crown } from 'lucide-react';
import ArenaCard from '../components/ArenaCard';
import SEO from '../components/SEO';
import { CreatorProfile, AppView, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface ArenaProps {
  creators: CreatorProfile[];
  onSelectCreator: (creator: CreatorProfile) => void;
  onNavigate: (view: AppView) => void;
}

const CATEGORIES = ["Tout", "Décoration", "Photographe", "DJ / Son", "Maquillage", "Traiteur", "Salle"];

export default function ArenaPage({ creators, onSelectCreator, onNavigate }: ArenaProps) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [activeCity, setActiveCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewProfile, setSelectedReviewProfile] = useState<CreatorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Platform Settings State
  const [settings, setSettings] = useState({
    announcementText: "",
    isAnnouncementActive: false,
    featuredProviderId: ""
  });

  // Content Modal State
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentModalType, setContentModalType] = useState<'about' | 'pricing' | 'partner' | 'privacy' | 'terms' | 'legal' | null>(null);

  // Fetch Reviews when modal opens
  useEffect(() => {
      if (selectedReviewProfile) {
          const fetchReviews = async () => {
              const q = query(collection(db, "reviews"), where("providerId", "==", selectedReviewProfile.id), orderBy("createdAt", "desc"));
              const querySnapshot = await getDocs(q);
              const fetchedReviews: Review[] = [];
              querySnapshot.forEach((doc) => {
                  fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
              });
              setReviews(fetchedReviews);
          };
          fetchReviews();
      }
  }, [selectedReviewProfile]);

  // Fetch Platform Settings
  useEffect(() => {
      const unsub = onSnapshot(doc(db, "platform", "settings"), (docSnap) => {
          if (docSnap.exists()) {
              setSettings(docSnap.data() as any);
          }
      });
      return () => unsub();
  }, []);

  const handleLoginForReview = async () => {
      try {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
      } catch (error) {
          console.error("Login failed", error);
      }
  };

  const handleSubmitReview = async () => {
      if (!user || !selectedReviewProfile || !newReview.comment.trim()) return;
      setIsSubmittingReview(true);
      try {
          await addDoc(collection(db, "reviews"), {
              providerId: selectedReviewProfile.id,
              userId: user.uid,
              userName: user.displayName || "Utilisateur",
              userImage: user.photoURL,
              rating: newReview.rating,
              comment: newReview.comment,
              createdAt: serverTimestamp(),
              date: new Date().toLocaleDateString()
          });
          setNewReview({ rating: 5, comment: '' });
          // Refresh reviews
          const q = query(collection(db, "reviews"), where("providerId", "==", selectedReviewProfile.id), orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const fetchedReviews: Review[] = [];
          querySnapshot.forEach((doc) => {
              fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
          });
          setReviews(fetchedReviews);
      } catch (error) {
          console.error("Error submitting review", error);
      }
      setIsSubmittingReview(false);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  const openContentModal = (type: 'about' | 'pricing' | 'partner' | 'privacy' | 'terms' | 'legal') => {
      setContentModalType(type);
      setContentModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredProviders = creators.filter(p => {
    // 1. Category Filter
    const pCat = (p.category || "").toLowerCase();
    const activeCat = activeCategory.toLowerCase();
    const matchesCat = 
        activeCategory === "Tout" || 
        pCat.includes(activeCat.split(' ')[0]) || 
        (activeCategory === "DJ / Son" && (pCat.includes("dj") || pCat.includes("son")));

    // 2. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
        !query ||
        p.name.toLowerCase().includes(query) || 
        pCat.includes(query) ||
        (p.portfolio.sections[0].content.title || "").toLowerCase().includes(query);

    // 3. City Filter
    const pAddress = p.portfolio.sections.find(s => s.type === 'contact')?.content.address || "";
    const pCity = p.location?.commune || "";
    const matchesCity = !activeCity || 
                        pAddress.toLowerCase().includes(activeCity.toLowerCase()) ||
                        pCity.toLowerCase().includes(activeCity.toLowerCase());

    const matchesTag = !activeTag || (p.tags || []).includes(activeTag);

    return matchesCat && matchesSearch && matchesCity && matchesTag;
  }).sort((a, b) => {
      // Featured provider always first
      if (a.id === settings.featuredProviderId) return -1;
      if (b.id === settings.featuredProviderId) return 1;
      return 0;
  });

  const handleOpenReview = (creator: CreatorProfile) => {
      setSelectedReviewProfile(creator);
      setReviewModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#FFD700] selection:text-black">
      <SEO 
        title="L'Arène des Créatifs | My Folio-Tag"
        description="Explorez l'Arène My Folio-Tag. Découvrez les meilleurs prestataires et talents de Kinshasa. Portfolios d'élite, avis clients et contact direct."
      />
      {/* HEADER NAVIGATION (Minimaliste & Noir) */}
      <nav className="fixed w-full z-50 top-0 left-0 px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div 
                className="text-xl font-black tracking-tighter flex items-center gap-1 cursor-pointer group"
                onClick={() => onNavigate(AppView.LANDING)}
            >
                <span className="text-[#FFD700] font-serif group-hover:scale-105 transition">MY</span> FOLIO <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] mt-1 shadow-[0_0_10px_#FFD700]"></div>
            </div>
            
            {/* Bouton Espace Prestataire */}
            <button 
                onClick={() => onNavigate(AppView.LOGIN)}
                className="bg-white/5 hover:bg-[#FFD700] hover:text-black text-white border border-white/10 hover:border-[#FFD700] text-[10px] font-bold px-6 py-2.5 rounded-full flex items-center gap-2 transition-all backdrop-blur-md"
            >
                <Sparkles size={14} /> ACCÉDER AU STUDIO
            </button>
        </div>
      </nav>

      {/* ANNONCE PLATEFORME (NOUVEAU) */}
      {settings.isAnnouncementActive && settings.announcementText && (
          <div className="fixed w-full z-[45] top-[73px] left-0 px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#FFD700]/20 animate-fade-in">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                  <Megaphone size={16} className="text-[#FFD700] animate-bounce"/>
                  <p className="text-[11px] md:text-xs font-bold text-[#FFD700] uppercase tracking-widest text-center">
                      {settings.announcementText}
                  </p>
              </div>
          </div>
      )}

      {/* ZONE DE RECHERCHE FLOTTANTE (Sticky sous le header) */}
      <div className={`pt-28 pb-8 px-4 sticky top-0 z-40 bg-gradient-to-b from-[#050505] via-[#050505]/95 to-transparent backdrop-blur-sm ${settings.isAnnouncementActive ? 'mt-12' : ''}`}>
         <div className="max-w-5xl mx-auto space-y-6">
             
             <div className="text-center mb-8 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                    L'ARÈNE DES <span className="text-[#FFD700]">EMPIRES</span>
                </h1>
                <p className="text-gray-400 text-sm uppercase tracking-widest">La Marketplace de l'Élite Congolaise</p>
             </div>

             {/* Barres de Recherche Glassmorphism */}
             <div className="flex flex-col md:flex-row gap-4">
                 {/* Barre 1 : Domaine */}
                 <div className="flex-1 relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD700]/20 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                     <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-2 py-1 backdrop-blur-xl">
                        <Search className="text-[#FFD700] ml-3 w-5 h-5" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher un domaine (ex: Art, Tech...)" 
                          className="w-full bg-transparent text-white px-3 py-3 text-sm focus:outline-none placeholder-gray-500 font-medium"
                        />
                     </div>
                 </div>

                 {/* Barre 2 : Localisation */}
                 <div className="flex-1 relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                     <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-2 py-1 backdrop-blur-xl">
                        <MapPin className="text-blue-400 ml-3 w-5 h-5" />
                        <input 
                            type="text"
                            value={activeCity} 
                            onChange={(e) => setActiveCity(e.target.value)}
                            placeholder="Ville ou Commune (ex: Goma...)"
                            className="w-full bg-transparent text-white px-3 py-3 text-sm focus:outline-none placeholder-gray-500 font-medium"
                        />
                     </div>
                 </div>
             </div>

             {/* Pills Categories */}
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-start md:justify-center">
                {CATEGORIES.map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
                            whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-bold transition-all duration-300 border
                            ${activeCategory === cat 
                                ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                                : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
         </div>
      </div>

        {/* SECTION "L'ARÈNE" - GRILLE */}
      <main className="flex-grow px-4 pb-20 max-w-7xl mx-auto w-full">
        
        <div className="flex items-center justify-between mb-8 px-2 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Résultats en direct</span>
            </div>
            <div className="text-[10px] text-[#FFD700] font-mono uppercase tracking-widest border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 rounded-full">
                {filteredProviders.length} Empires Détectés
            </div>
        </div>
        
        {/* GRILLE RESPONSIVE */}
        {filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider, index) => {
                    const isFeatured = provider.id === settings.featuredProviderId;
                    return (
                        <div 
                            key={provider.id} 
                            className={`animate-fade-in-up relative ${isFeatured ? 'md:col-span-2 lg:col-span-1' : ''}`} 
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {isFeatured && (
                                <div className="absolute -top-3 -right-3 z-10 bg-[#D4AF37] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1 border-2 border-black">
                                    <Crown size={10} fill="black"/> TOP PRESTATAIRE
                                </div>
                            )}
                            <div className={`h-full transition-all duration-500 ${isFeatured ? 'border-2 border-[#D4AF37] rounded-[2rem] shadow-[0_0_25px_rgba(212,175,55,0.2)] scale-[1.02]' : ''}`}>
                                <ArenaCard 
                                    provider={provider} 
                                    onClick={() => onSelectCreator(provider)}
                                    onReviewClick={() => handleOpenReview(provider)}
                                    onTagClick={handleTagClick}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20 bg-[#111] rounded-[2rem] border border-dashed border-white/10">
                <p className="text-gray-500 font-medium">L'Arène est calme pour le moment.</p>
                {searchQuery || activeCategory !== "Tout" || activeCity ? (
                   <button onClick={() => {setActiveCategory("Tout"); setSearchQuery(""); setActiveCity("")}} className="text-[#FFD700] text-xs font-bold mt-4 hover:underline">Réinitialiser les filtres</button>
                ) : (
                   <p className="text-xs text-gray-600 mt-2">Revenez plus tard ou activez votre empire.</p>
                )}
            </div>
        )}

      </main>

      {/* FOOTER COMPLET */}
      <footer className="py-12 border-t border-white/5 bg-[#0a0a0a] text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
              <div>
                  <h4 className="text-white font-black uppercase tracking-widest mb-4 text-xs">My Folio-Tag</h4>
                  <p className="text-gray-500 text-[10px] leading-relaxed">
                      La première plateforme dédiée à l'élite créative et entrepreneuriale de Kinshasa. 
                      Propulsez votre empire vers de nouveaux sommets.
                  </p>
              </div>
              <div>
                  <h4 className="text-white font-black uppercase tracking-widest mb-4 text-xs">Liens Utiles</h4>
                  <ul className="space-y-2 text-[10px] text-gray-500">
                      <li><button onClick={() => openContentModal('about')} className="hover:text-[#FFD700] transition">À propos</button></li>
                      <li><button onClick={() => openContentModal('pricing')} className="hover:text-[#FFD700] transition">Tarifs</button></li>
                      <li><button onClick={() => openContentModal('partner')} className="hover:text-[#FFD700] transition">Devenir Partenaire</button></li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-white font-black uppercase tracking-widest mb-4 text-xs">Légal</h4>
                  <ul className="space-y-2 text-[10px] text-gray-500">
                      <li><button onClick={() => openContentModal('privacy')} className="hover:text-[#FFD700] transition">Confidentialité</button></li>
                      <li><button onClick={() => openContentModal('terms')} className="hover:text-[#FFD700] transition">Conditions d'utilisation</button></li>
                      <li><button onClick={() => openContentModal('legal')} className="hover:text-[#FFD700] transition">Mentions Légales</button></li>
                  </ul>
              </div>
          </div>
          <div className="text-[10px] text-gray-700 font-mono uppercase tracking-widest pt-8 border-t border-white/5">
            © 2026 My Folio-Tag — Kinshasa. Tous droits réservés.
          </div>
      </footer>

      {/* FLOATING SUPPORT BUTTON - Lien dynamique si possible, sinon un lien générique */}
      <a 
        href="https://wa.me/243851606236" // TODO: Rendre ce lien dynamique via les settings de la plateforme
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all group flex items-center gap-2 overflow-hidden hover:pr-6"
      >
          <MessageCircle size={24} fill="white" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-xs font-bold whitespace-nowrap">Support 24/7</span>
      </a>

      {/* --- MODAL AVIS (Review Popup) --- */}
      {reviewModalOpen && selectedReviewProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]">
                  
                  {/* Close Button */}
                  <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                      <X size={20}/>
                  </button>

                  {/* Header Modal */}
                  <div className="p-8 bg-gradient-to-b from-[#1a1a1a] to-[#111] border-b border-white/5 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-r from-[#FFD700] to-[#FDB931] mb-4 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                          <img 
                            src={selectedReviewProfile.portfolio.sections.find(s => s.type === 'bio')?.content.image || "https://via.placeholder.com/100"} 
                            className="w-full h-full rounded-full object-cover border-4 border-black"
                          />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-1 font-serif tracking-tight">{selectedReviewProfile.name}</h3>
                      <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="flex text-[#FFD700]">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={16} fill={i < Math.round(selectedReviewProfile.rating) ? "#FFD700" : "transparent"}/>
                              ))}
                          </div>
                          <span className="text-xs text-gray-400 font-bold">({selectedReviewProfile.reviewCount} avis)</span>
                      </div>
                  </div>

                  {/* Body Modal (Scrollable) */}
                  <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#0a0a0a]">
                      
                      {/* Formulaire d'ajout */}
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                          {!user ? (
                              <div className="text-center space-y-3">
                                  <p className="text-xs text-gray-400">Connectez-vous pour partager votre expérience.</p>
                                  <button onClick={handleLoginForReview} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FFD700] transition">
                                      <LogIn size={16}/> Se connecter avec Google
                                  </button>
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-white flex items-center gap-2"><User size={14}/> {user.displayName}</span>
                                      <div className="flex gap-1">
                                          {[1,2,3,4,5].map(star => (
                                              <Star 
                                                  key={star} 
                                                  size={18} 
                                                  className={`cursor-pointer transition ${star <= newReview.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-600'}`}
                                                  onClick={() => setNewReview({...newReview, rating: star})}
                                              />
                                          ))}
                                      </div>
                                  </div>
                                  <textarea 
                                      value={newReview.comment}
                                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                      placeholder="Racontez votre expérience..."
                                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD700] outline-none h-24 resize-none"
                                  />
                                  <button 
                                    onClick={handleSubmitReview} 
                                    disabled={isSubmittingReview || !newReview.comment.trim()}
                                    className="w-full bg-[#FFD700] text-black font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FDB931] transition disabled:opacity-50"
                                  >
                                      {isSubmittingReview ? <Sparkles size={16} className="animate-spin"/> : <Send size={16}/>} Publier l'avis
                                  </button>
                              </div>
                          )}
                      </div>

                      {/* Liste des Avis */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Derniers Avis</h4>
                          {reviews.length === 0 ? (
                              <p className="text-center text-xs text-gray-600 italic py-4">Soyez le premier à donner votre avis.</p>
                          ) : (
                              reviews.map(review => (
                                  <div key={review.id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                                  {review.userImage ? <img src={review.userImage} className="w-full h-full object-cover"/> : <User size={16} className="m-auto mt-2 text-gray-400"/>}
                                              </div>
                                              <div>
                                                  <p className="text-xs font-bold text-white">{review.userName}</p>
                                                  <div className="flex text-[#FFD700] text-[10px]">
                                                      {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < review.rating ? "#FFD700" : "transparent"}/>)}
                                                  </div>
                                              </div>
                                          </div>
                                          <span className="text-[10px] text-gray-500">{review.date}</span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed pl-10">"{review.comment}"</p>
                                  </div>
                              ))
                          )}
                      </div>

                  </div>

              </div>
          </div>
      )}

      {/* --- MODAL CONTENU INSTITUTIONNEL --- */}
      {contentModalOpen && contentModalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
              <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                  
                  <button onClick={() => setContentModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white z-10 bg-black/50 p-2 rounded-full backdrop-blur-sm transition">
                      <X size={24}/>
                  </button>

                  <div className="p-10 md:p-16 text-center">
                      <div className="mb-8">
                          <h2 className="text-3xl md:text-4xl font-black text-white font-serif tracking-tight mb-2 uppercase">
                              {contentModalType === 'about' && "À Propos"}
                              {contentModalType === 'pricing' && "Tarifs Empire"}
                              {contentModalType === 'partner' && "Partenariat"}
                              {contentModalType === 'privacy' && "Confidentialité"}
                              {contentModalType === 'terms' && "Conditions"}
                              {contentModalType === 'legal' && "Mentions Légales"}
                          </h2>
                          <div className="w-24 h-1 bg-[#FFD700] mx-auto rounded-full shadow-[0_0_15px_#FFD700]"></div>
                      </div>

                      <div className="text-gray-300 text-sm md:text-base leading-relaxed font-light space-y-6">
                          {contentModalType === 'about' && (
                              <p>My Folio-Tag est l'élite du portfolio numérique en RDC. Fruit de l'expertise de <strong className="text-white">HASHTAG DIGITAL</strong>, notre mission est de transformer chaque talent en un Empire visible. Nous offrons aux créateurs kinois une vitrine de classe mondiale, alliant technologie de pointe et prestige visuel.</p>
                          )}
                          {contentModalType === 'pricing' && (
                              <p>L'activation de votre Empire est à prix unique. Cela inclut votre site personnalisé renouvelable après 1 an, votre QR Code pro, votre export PDF haute définition et votre place prioritaire dans l'Arène.</p>
                          )}
                          {contentModalType === 'partner' && (
                              <p>Rejoignez l'écosystème Hashtag Digital. Vous êtes influenceur, agence ou apporteur d'affaires ? Contactez-nous pour intégrer notre programme de partenariat et touchez une commission sur chaque Empire activé.</p>
                          )}
                          {contentModalType === 'privacy' && (
                              <p>Vos données sont protégées par les standards de sécurité de Hashtag Digital. Nous ne revendons jamais vos informations. Votre contenu reste votre propriété exclusive.</p>
                          )}
                          {contentModalType === 'terms' && (
                              <p>L'utilisation de My Folio-Tag implique le respect de l'éthique professionnelle. Tout contenu illicite sera banni de l'Arène sans préavis.</p>
                          )}
                          {contentModalType === 'legal' && (
                              <p>Édité par <strong className="text-white">HASHTAG DIGITAL</strong> — Kinshasa, RDC.</p>
                          )}
                      </div>

                      <div className="mt-12 pt-8 border-t border-white/5">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">My Folio-Tag • L'Excellence Numérique</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}