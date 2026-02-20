import React, { useState, useEffect } from 'react';

import SplashScreen from './components/SplashScreen';
import TermsPage from './pages/Terms';
import { AppView, CreatorProfile } from './types';
import Wizard from './Wizard';
import ArenaPage from './pages/Arena';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import AdminDashboard from './Admin';
import PortfolioPreview from './components/PortfolioPreview';
import SEO from './components/SEO';
import { ArrowLeft, Sparkles, Search } from 'lucide-react';
import GlassCard from './components/ui/GlassCard';
import GoldButton from './components/ui/GoldButton';
import { useAuth } from './context/AuthContext';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from './lib/firebase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformPrice, setPlatformPrice] = useState<number | null>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- LIVE SYNC AVEC L'ARÈNE (FIREBASE ONLY - NO MOCKS) ---
  useEffect(() => {
    // Écoute STRICTE : Uniquement les status="active"
    const q = query(collection(db, "users"), where("status", "==", "active"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveCreators = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Reconstitution du Portfolio Config
            const sections = [
                {
                    type: 'hero',
                    content: {
                        title: data.name,
                        subtitle: data.profession,
                        backgroundImage: data.coverImage || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
                        buttonText: "Découvrir"
                    }
                },
                {
                    type: 'bio',
                    content: {
                        image: data.profileImage || "https://via.placeholder.com/150",
                        name: data.name,
                        description: data.bio,
                        stats: {
                           years: data.yearsOfExperience || 1,
                           projects: data.reviewCount || 0
                        }
                    }
                },
                {
                    type: 'services',
                    content: {
                        items: data.catalog || []
                    }
                },
                {
                    type: 'gallery',
                    content: {
                        images: data.projects?.map((p: any) => p.image).filter(Boolean) || []
                    }
                },
                {
                    type: 'contact',
                    content: {
                        address: "Kinshasa, Gombe",
                        actionValue: data.whatsapp,
                        phone: data.phone,
                        email: data.email
                    }
                },
                {
                    type: 'social',
                    content: {
                        userAvatar: data.profileImage,
                        posts: data.posts || []
                    }
                }
            ];

            // LOGIQUE DE TRI "LIVE" ROBUSTE
            let sortTimestamp = new Date().toISOString();
            
            if (data.activatedAt) {
                if (typeof data.activatedAt.toDate === 'function') {
                    sortTimestamp = data.activatedAt.toDate().toISOString();
                } else {
                    sortTimestamp = String(data.activatedAt);
                }
            } else if (data.createdAt?.toDate) {
                sortTimestamp = data.createdAt.toDate().toISOString();
            }

            return {
                id: doc.id,
                name: data.name || "Artiste",
                category: data.profession || "Créatif",
                rating: data.rating || 5,
                reviewCount: data.reviewCount || 0,
                verified: data.isVerified || false,
                joinedAt: sortTimestamp,
                location: data.location || { commune: '', address: '' },
                phone: data.phone || "",
                tags: data.tags || [],
                expiryDate: data.expiryDate,
                portfolio: {
                    theme: { primaryColor: 'text-gold-400', style: 'elegant' },
                    sections: sections,
                    layoutType: data.layoutType || 'GALLERY'
                }
            } as CreatorProfile;
        });
        
        // TRI LIVE : Les plus récents en haut
        liveCreators.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

        // MISE À JOUR D'ÉTAT (ZÉRO MOCK)
        setCreators(liveCreators);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "platform", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        setPlatformPrice(docSnap.data().currentPrice || 41);
      }
    });
    return () => unsub();
  }, []);

  const handlePublish = (newProfile: CreatorProfile) => {
    // Optimistic update pour l'expérience utilisateur immédiate
    setCreators(prev => [newProfile, ...prev]);
    setView(AppView.ARENA);
  };

  if (loading) {
    return <SplashScreen />;
  }

  const Landing = () => (
    <div className="min-h-screen bg-majestic-gradient text-white font-sans selection:bg-gold-500 selection:text-black">
      <SEO />
      {/* --- HEADER --- */}
      <nav className="fixed w-full z-50 p-4">
        <GlassCard className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center !rounded-full">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
            <span className="text-gold-400">MY</span>FOLIO-TAG
            <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse shadow-glow"></div>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
            <button onClick={() => setView(AppView.ARENA)} className="hover:text-gold-400 transition">L'Arène</button>
            <button onClick={() => setView(AppView.ARENA)} className="hover:text-gold-400 transition">Prestataires</button>
            <button onClick={() => setView(AppView.WIZARD)} className="hover:text-gold-400 transition">Créer</button>
            <button onClick={() => setView(AppView.TERMS)} className="hover:text-gold-400 transition">CGU</button>
          </div>
          <GoldButton className="text-sm px-6 py-2" onClick={() => setView(AppView.WIZARD)}>
            Rejoindre l'Arène
          </GoldButton>
        </GlassCard>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          L'Élite des Créatifs <br />
          <span className="text-transparent bg-clip-text bg-gold-shine">Congolais</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Rejoignez l'Arène. Créez votre portfolio vitrine, soyez noté, et gagnez la confiance de vos clients.
        </p>

        {/* Barre de Recherche Glassmorphism */}
        <div className="max-w-xl mx-auto relative group z-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-600 to-white/20 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative flex bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2">
                <Search className="text-gray-400 ml-4 mt-3" />
                <input 
                  type="text" 
                  placeholder="Je cherche un photographe, un DJ..." 
                  className="w-full bg-transparent text-white px-4 py-2 focus:outline-none placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && setView(AppView.ARENA)}
                />
                <button 
                  onClick={() => setView(AppView.ARENA)}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
                >
                    <Sparkles className="w-5 h-5 text-gold-400" />
                </button>
            </div>
        </div>
      </section>

      {/* --- LIVE PREVIEW ARÈNE (SAMPLES) --- */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Les Stars de l'Arène <span className="text-gold-400">✦</span></h2>
        
        {creators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {creators.slice(0, 3).map((creator) => (
                  <GlassCard 
                    key={creator.id}
                    onClick={() => {
                      setSelectedCreator(creator);
                      setView(AppView.ARENA);
                    }}
                    className="p-0 hover:scale-[1.02] transition duration-300 group cursor-pointer"
                  >
                      <div className="h-48 bg-gray-800 relative">
                          <img 
                            src={creator.portfolio.sections[0].content.backgroundImage} 
                            alt={creator.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          <span className="absolute top-4 right-4 bg-black/50 backdrop-blur border border-gold-500/30 text-gold-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              ★ {creator.rating}
                          </span>
                      </div>
                      <div className="p-6">
                          <h3 className="text-xl font-bold mb-1 group-hover:text-gold-400 transition">{creator.name}</h3>
                          <p className="text-gray-400 text-sm mb-4">{creator.category} • Kinshasa</p>
                      </div>
                  </GlassCard>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 px-6 bg-white/5 rounded-[3rem] border border-dashed border-white/10 text-gray-500">
                <p className="mb-4 text-lg">L'Arène attend ses premiers champions.</p>
                <GoldButton className="text-sm px-6 py-2" onClick={() => setView(AppView.WIZARD)}>
                    Devenir le Premier
                </GoldButton>
            </div>
        )}
      </section>
    </div>
  );

  if (view === AppView.LANDING) return <Landing />;
  
  if (view === AppView.WIZARD) return (
    <Wizard 
      platformPrice={platformPrice}
      onBack={() => setView(AppView.LANDING)} 
      onPublish={handlePublish} 
      onAuthRedirect={() => setView(AppView.REGISTER)}
      onNavigate={setView}
    />
  );

  if (view === AppView.REGISTER) return <RegisterPage onNavigate={setView} />;
  
  if (view === AppView.LOGIN) return <LoginPage onNavigate={setView} />;
  
  if (view === AppView.ADMIN) return <AdminDashboard onNavigate={setView} />;

  if (view === AppView.TERMS) return <TermsPage onNavigate={setView} />;

  if (view === AppView.ARENA) {
    if (selectedCreator) {
      return (
        <div className="min-h-screen bg-black relative">
          <PortfolioPreview 
            config={selectedCreator.portfolio} 
            phone={selectedCreator.phone}
            creatorId={selectedCreator.id}
            expiryDate={selectedCreator.expiryDate}
            onBack={() => setSelectedCreator(null)}
          />
        </div>
      );
    }
    return (
       <ArenaPage creators={creators} onSelectCreator={setSelectedCreator} onNavigate={setView} />
    );
  }

  return <div className="min-h-screen bg-black flex items-center justify-center text-[#FFD700]">Loading Empire...</div>;
};

export default App;