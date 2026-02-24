import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import TermsPage from './pages/Terms';
import { AppView, CreatorProfile, TemplateConfig } from './types';
import Wizard from './pages/Wizard';
import ArenaPage from './pages/Arena';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/admin';
import PortfolioPreview from './components/PortfolioPreview';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SEO from './components/SEO';
import { ArrowLeft, Sparkles, Search, Share2 } from 'lucide-react';
import GlassCard from './components/ui/GlassCard';
import GoldButton from './components/ui/GoldButton';
import { useAuth } from './context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';
import { templateConfig as initialTemplateConfig } from './data/templates';
import { DEFAULT_CREATOR_DATA } from './config/constants';

// Le composant Landing est maintenant défini à l'extérieur pour une meilleure structure.
const Landing = ({ setView, creators, setSelectedCreator }) => (
  <div className="min-h-screen bg-majestic-gradient text-white font-sans selection:bg-gold-500 selection:text-black">
    <SEO />
    <nav className="fixed w-full z-50 p-4">
      <GlassCard className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center !rounded-full">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
          <span className="text-gold-400">MY</span>FOLIO-TAG
          <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse shadow-glow"></div>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
          <button onClick={() => setView(AppView.ARENA)} className="hover:text-gold-400 transition">L'Arène</button>
          <button onClick={() => setView(AppView.WIZARD)} className="hover:text-gold-400 transition">Créer</button>
          <button onClick={() => setView(AppView.TERMS)} className="hover:text-gold-400 transition">CGU</button>
        </div>
        <GoldButton className="text-sm px-6 py-2" onClick={() => setView(AppView.WIZARD)}>
          Rejoindre l'Arène
        </GoldButton>
      </GlassCard>
    </nav>

    <section className="relative pt-40 pb-20 px-4 text-center overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
        L'Élite des Créatifs <br />
        <span className="text-transparent bg-clip-text bg-gold-shine">Congolais</span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
        Rejoignez l'Arène. Créez votre portfolio vitrine, soyez noté, et gagnez la confiance de vos clients.
      </p>
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

    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-10 text-center">Les Stars de l'Arène <span className="text-gold-400">✦</span></h2>
      {creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {creators.filter(c => c && c.id && c.portfolio && Array.isArray(c.portfolio.sections)).slice(0, 3).map((creator) => (
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
                  src={creator?.portfolio?.sections?.[0]?.content?.backgroundImage || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"} 
                  alt={creator?.name || "Créatif"}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <span className="absolute top-4 right-4 bg-black/50 backdrop-blur border border-gold-500/30 text-gold-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  ★ {creator?.rating || 5}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 group-hover:text-gold-400 transition">{creator?.name || "Prestataire"}</h3>
                <p className="text-gray-400 text-sm mb-4">{creator?.category || "Créatif"} • Kinshasa</p>
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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [isolatedCreator, setIsolatedCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformPrice, setPlatformPrice] = useState<number | null>(null);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(initialTemplateConfig);

  useEffect(() => {
    const pathname = window.location.pathname.slice(1);
    const internalRoutes = ['login', 'register', 'admin', 'terms', 'wizard'];

    if (pathname && !internalRoutes.includes(pathname)) {
      const fetchCreatorBySlug = async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('portfolioSlug', '==', pathname));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const creatorDoc = querySnapshot.docs[0];
          const docData = creatorDoc.data();
          const finalData: any = { ...DEFAULT_CREATOR_DATA, ...docData };

          const sections = [
              { type: 'hero', content: { title: finalData.name, subtitle: finalData.profession, backgroundImage: finalData.coverImage, buttonText: "Découvrir" } },
              { type: 'bio', content: { image: finalData.profileImage, name: finalData.name, description: finalData.bio, stats: { years: finalData.yearsOfExperience || 1, projects: finalData.reviewCount || 0 } } },
              { type: 'services', content: { items: finalData.catalog || [] } },
              { type: 'gallery', content: { images: finalData.projects?.map((p: any) => p.image).filter(Boolean) || [] } },
              { type: 'contact', content: { address: "Kinshasa, Gombe", actionValue: finalData.whatsapp, phone: finalData.phone, email: finalData.email } },
              { type: 'social', content: { userAvatar: finalData.profileImage, posts: finalData.posts || [] } }
          ];
          const joinedAtTimestamp = (finalData.createdAt && typeof finalData.createdAt.toDate === 'function')
            ? finalData.createdAt.toDate().toISOString()
            : new Date().toISOString();

          setIsolatedCreator({
            id: creatorDoc.id,
            name: finalData.name || "Artiste",
            category: finalData.profession || "Créatif",
            rating: finalData.rating || 5,
            reviewCount: finalData.reviewCount || 0,
            verified: finalData.isVerified || false,
            joinedAt: joinedAtTimestamp,
            location: finalData.location || { commune: '', address: '' },
            phone: finalData.phone || "",
            tags: finalData.tags || [],
            expiryDate: finalData.expiryDate,
            portfolioTitle: finalData.portfolioTitle,
            labels: finalData.labels,
            templateId: finalData.templateId,
            googleFormUrl: finalData.googleFormUrl,
            portfolio: { theme: { primaryColor: 'text-gold-400', style: finalData.themeStyle || 'luxe' }, sections: sections, layoutType: finalData.layoutType || 'GALLERY' }
          } as CreatorProfile & { portfolioTitle?: string });
        } else {
          setView(AppView.LANDING);
        }
        setLoading(false);
      };
      fetchCreatorBySlug();
    } else {
      const q = query(collection(db, "users"), where("status", "==", "active"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveCreators = snapshot.docs.map(doc => {
          const docData = doc.data();
          const finalData: any = { ...DEFAULT_CREATOR_DATA, ...docData };

          const sections = [
              { type: 'hero', content: { title: finalData.name, subtitle: finalData.profession, backgroundImage: finalData.coverImage, buttonText: "Découvrir" } },
              { type: 'bio', content: { image: finalData.profileImage, name: finalData.name, description: finalData.bio, stats: { years: finalData.yearsOfExperience || 1, projects: finalData.reviewCount || 0 } } },
              { type: 'services', content: { items: finalData.catalog || [] } },
              { type: 'gallery', content: { images: finalData.projects?.map((p: any) => p.image).filter(Boolean) || [] } },
              { type: 'contact', content: { address: "Kinshasa, Gombe", actionValue: finalData.whatsapp, phone: finalData.phone, email: finalData.email } },
              { type: 'social', content: { userAvatar: finalData.profileImage, posts: finalData.posts || [] } }
          ];
          let sortTimestamp = new Date().toISOString();
          if (finalData.activatedAt && typeof finalData.activatedAt.toDate === 'function') {
            sortTimestamp = finalData.activatedAt.toDate().toISOString();
          } else if (finalData.createdAt && typeof finalData.createdAt.toDate === 'function') {
            sortTimestamp = finalData.createdAt.toDate().toISOString();
          }

          return {
            id: doc.id,
            name: finalData.name || "Artiste",
            category: finalData.profession || "Créatif",
            rating: finalData.rating || 5,
            reviewCount: finalData.reviewCount || 0,
            verified: finalData.isVerified || false,
            joinedAt: sortTimestamp,
            location: finalData.location || { commune: '', address: '' },
            phone: finalData.phone || "",
            tags: finalData.tags || [],
            expiryDate: finalData.expiryDate,
            labels: finalData.labels,
            templateId: finalData.templateId,
            googleFormUrl: finalData.googleFormUrl,
            portfolio: { theme: { primaryColor: 'text-gold-400', style: 'elegant' }, sections: sections, layoutType: finalData.layoutType || 'GALLERY' }
          } as CreatorProfile;
        });
        liveCreators.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
        setCreators(liveCreators);
        setLoading(false);
      });
      return () => unsubscribe && unsubscribe();
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "platform", "settings"), (docSnap) => {
      if (docSnap.exists()) setPlatformPrice(docSnap.data().currentPrice || 41);
    });
    return () => unsub();
  }, []);

  const handlePublish = (newProfile: CreatorProfile) => {
    setCreators(prev => [newProfile, ...prev]);
    setView(AppView.ARENA);
  };
  
  const generateProLink = (slug) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Lien Pro copié !');
  }

  if (loading) return <SplashScreen />;

  if (isolatedCreator) {
    const hero = isolatedCreator?.portfolio?.sections?.find(s => s.type === 'hero')?.content || {};
    const bio = isolatedCreator?.portfolio?.sections?.find(s => s.type === 'bio')?.content || {};

    return (
      <div className="min-h-screen bg-black relative">
        <SEO 
          title={`${hero.title || 'Artiste'} | Portfolio Officiel`}
          description={`Découvrez l'univers de ${hero.title || 'ce créatif'}, expert en ${hero.subtitle || 'son domaine'}. Visitez son Empire numérique sur My Folio-Tag.`}
          image={bio.image || hero.backgroundImage}
          type="profile"
        />
        <ErrorBoundary>
          <PortfolioPreview 
            config={isolatedCreator.portfolio} 
            phone={isolatedCreator.phone}
            creatorId={isolatedCreator.id}
            expiryDate={isolatedCreator.expiryDate}
            isIsolated={true}
            creatorName={isolatedCreator.name}
            creatorData={isolatedCreator}
          />
        </ErrorBoundary>
        <button 
          onClick={() => window.location.href = window.location.origin}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white py-2 px-4 rounded-full flex items-center gap-2 border border-white/20 hover:bg-white/10 transition z-50 text-xs"
        >
          <ArrowLeft size={14} /> Retour à l'Arène
        </button>
        <button 
          onClick={() => generateProLink(isolatedCreator.portfolioSlug)}
          className="fixed bottom-4 right-4 bg-gold-500/80 backdrop-blur-md text-black p-3 rounded-full flex items-center gap-2 border border-gold-500/50 hover:bg-gold-500 transition z-50"
        >
          <Share2 size={16} />
        </button>
      </div>
    );
  }

  switch (view) {
    case AppView.LANDING:
      return <Landing setView={setView} creators={creators} setSelectedCreator={setSelectedCreator} />;
    case AppView.WIZARD:
      return <Wizard platformPrice={platformPrice} onBack={() => setView(AppView.LANDING)} onPublish={handlePublish} onAuthRedirect={() => setView(AppView.REGISTER)} onNavigate={setView} />;
    case AppView.REGISTER:
      return <RegisterPage onNavigate={setView} />;
    case AppView.LOGIN:
      return <LoginPage onNavigate={setView} />;
    case AppView.ADMIN:
      return <AdminDashboard onNavigate={setView} />;
    case AppView.TERMS:
      return <TermsPage onNavigate={setView} />;
    case AppView.ARENA:
      if (selectedCreator) {
        return (
          <div className="min-h-screen bg-black relative">
            <SEO 
              title={`${selectedCreator?.name || "Prestataire"} | Portfolio Officiel`}
              description={`Découvrez l'univers de ${selectedCreator?.name || "ce prestataire"}, expert en ${selectedCreator?.category || "son domaine"}. Visitez son Empire numérique sur My Folio-Tag.`}
              image={selectedCreator?.portfolio?.sections?.[0]?.content?.backgroundImage || selectedCreator?.portfolio?.sections?.[1]?.content?.image || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"}
              type="profile"
            />
            <ErrorBoundary>
              <PortfolioPreview 
                config={selectedCreator.portfolio} 
                phone={selectedCreator.phone}
                creatorId={selectedCreator.id}
                expiryDate={selectedCreator.expiryDate}
                onBack={() => setSelectedCreator(null)}
                creatorName={selectedCreator.name}
                creatorData={selectedCreator}
              />
            </ErrorBoundary>
          </div>
        );
      }
      return <ArenaPage onSelectCreator={setSelectedCreator} onNavigate={setView} />;
    default:
      return <div className="min-h-screen bg-black flex items-center justify-center text-[#FFD700]">Chargement de l'Empire...</div>;
  }
};

export default App;