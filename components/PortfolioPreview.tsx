import React, { useState, useEffect } from 'react';
import { PortfolioConfig } from '../types';
import SEO from './SEO';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Phone, Mail, MessageCircle, MapPin, ShieldCheck, Star, ArrowRight, 
  Instagram, Facebook, Linkedin, X, Map, Clock, Award, GraduationCap, 
  ShoppingBag, Menu, X as CloseIcon, ChevronRight, ChevronLeft, ArrowLeft,
  CheckCircle, Sparkles, ShoppingCart, Calendar, UserPlus, Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import vCard from 'vcf';

import { EXCHANGE_RATE, TEMPLATES, GOOGLE_FONTS_URL } from '../config/constants';

const getTemplateStyles = (templateId: string) => {
  return TEMPLATES[templateId] || TEMPLATES['gold-luxury'];
};

import TestimonialsLego from './TestimonialsLego';

const generateWhatsAppLink = (phone: string, itemName: string, type: 'commander' | 'réserver' | 'discuter de') => {
  if (!phone) return '#';
  // Nettoyage rigoureux : ne garder que les chiffres
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Logique spécifique RDC si nécessaire (déjà gérée par l'utilisateur lors de la saisie, mais on assure le format wa.me)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '243' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('243') && cleanPhone.length === 9) {
    cleanPhone = '243' + cleanPhone;
  }

  const message = `Bonjour ! Je vous contacte depuis votre portfolio My Folio-Tag. Je souhaite ${type} : *${itemName}*.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

const CatalogueLegos = ({ items, phone, title }: { items: any[], phone: string, title?: string }) => {
  const [currency, setCurrency] = useState('USD');

  const convertPrice = (price: string) => {
    if (currency === 'CDF') {
      const priceInUsd = parseFloat(price.replace(/[^0-9.-]+/g, ""));
      if (isNaN(priceInUsd)) return price;
      return `${(priceInUsd * EXCHANGE_RATE).toLocaleString('fr-FR')} CDF`;
    }
    return price;
  };

  return (
  <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">{title || 'Catalogue'}</h3>
      <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">Articles & Tarifs</h2>
      <div className="mt-4">
        <button onClick={() => setCurrency('USD')} className={`px-4 py-2 rounded-l-full ${currency === 'USD' ? 'bg-gold-400 text-black' : 'bg-white/10 text-white'}`}>USD</button>
        <button onClick={() => setCurrency('CDF')} className={`px-4 py-2 rounded-r-full ${currency === 'CDF' ? 'bg-gold-400 text-black' : 'bg-white/10 text-white'}`}>CDF</button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#FFD700]/30 transition duration-500"
        >
          <div className="h-64 bg-gray-900 relative overflow-hidden">
            <img src={item.images?.[0] || "https://via.placeholder.com/400x400"} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.title} />
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[#FFD700] font-bold text-sm">
              {convertPrice(item.price)}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 font-serif">{item.title}</h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>
            {phone ? (
              <a 
                href={generateWhatsAppLink(phone, item.title, 'commander')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={14} /> Commander
              </a>
            ) : (
              <div className="w-full py-3 bg-white/5 border border-white/5 text-gray-600 rounded-xl font-bold text-[10px] uppercase text-center italic">
                Contact non configuré
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
)};

const ServicesLegos = ({ items, phone, title }: { items: any[], phone: string, title?: string }) => (
  <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">{title || 'Services'}</h3>
      <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">Prestations & Expertise</h2>
    </div>
    <div className="space-y-6">
      {items.map((item, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#111] border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/5 transition group"
        >
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2 font-serif group-hover:text-[#FFD700] transition">{item.title}</h3>
            <p className="text-gray-400 text-sm max-w-2xl">{item.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-2xl font-black text-white">{item.price}</div>
            {phone ? (
              <a 
                href={generateWhatsAppLink(phone, item.title, 'réserver')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#FFD700] text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition flex items-center gap-2"
              >
                <Calendar size={14} /> Réserver un créneau
              </a>
            ) : (
              <div className="text-[10px] text-gray-600 italic">Contact non configuré</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

interface PortfolioPreviewProps {
  config: PortfolioConfig;
  phone?: string;
  creatorId?: string;
  isMobileView?: boolean;
  onBack?: () => void;
  expiryDate?: string;
  isIsolated?: boolean;
  creatorName?: string;
  creatorData?: any;
}



interface PortfolioPost {
  id: string;
  content: string;
  images?: string[];
  imageUrl?: string;
  createdAt: any;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ config, phone, creatorId, onBack, expiryDate, isIsolated, creatorName, creatorData }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<PortfolioPost[]>([]);

  const handleVCardExport = () => {
    const card = new vCard();
    card.add('fn', config.sections.find(s => s.type === 'hero')?.content.title);
    if (phone) {
      card.add('tel', phone, { type: 'work' });
    }
    card.add('url', window.location.href);

    const cardData = card.toString();
    const blob = new Blob([cardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.sections.find(s => s.type === 'hero')?.content.title}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isExpired = expiryDate && new Date() > new Date(expiryDate);

  if (isExpired) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-black border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-500/20 my-12 p-8 text-center flex flex-col items-center justify-center h-[80vh]">
        <Ban size={48} className="text-red-500 mb-4"/>
        <h2 className="text-3xl font-black text-white mb-2">Accès Suspendu</h2>
        <p className="text-gray-400 max-w-md">L'abonnement de ce créateur a expiré. Veuillez contacter le support pour renouveler l'accès.</p>
      </div>
    );
  }

  // --- LIVE POSTS SYNC (Filtered by Creator) ---
  useEffect(() => {
    if (!creatorId) return;

    const q = query(
      collection(db, "posts"), 
      where("userId", "==", creatorId),
      orderBy("createdAt", "desc"), 
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioPost));
      setPosts(newPosts);
    });

    return () => unsubscribe();
  }, [creatorId]);

  // EXTRACTION DES DONNÉES
  const sections = config.sections;
  const hero = sections.find(s => s.type === 'hero')?.content || {};
  const bio = sections.find(s => s.type === 'bio')?.content || {};
  const contact = sections.find(s => s.type === 'contact')?.content || {};
  const services = sections.find(s => s.type === 'services')?.content?.items || [];
  const gallery = sections.find(s => s.type === 'gallery')?.content?.images || [];
  const catalogSection = sections.find(s => s.type === 'catalog')?.content || {};
  const testimonialsSection = sections.find(s => s.type === 'testimonials')?.content || {};
  const partnersSection = sections.find(s => s.type === 'partners')?.content || {};
  const experienceSection = sections.find(s => s.type === 'experience')?.content || {};
  const socialSection = sections.find(s => s.type === 'social')?.content || {};
  const skillsSection = sections.find(s => s.type === 'services')?.content || {};
  const projectsSection = sections.find(s => s.type === 'gallery')?.content || {};
  
  // Stats (si injectées) ou fallback
  const stats = bio.stats || { years: 5, projects: 20 };

  // SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  // STYLES
  // Logique de verrouillage des thèmes : si pas premium/vip, force le thème par défaut
  const isPremium = creatorData?.plan === 'premium' || creatorData?.plan === 'vip';
  const effectiveTemplateId = isPremium ? creatorData?.templateId : 'gold-luxury';
  const styles = getTemplateStyles(effectiveTemplateId);
  const fontSerif = styles.font;

  // --- COMPONENTS ---

  const Navbar = () => (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed ${isIsolated ? 'top-8' : 'top-0'} left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
            {onBack && (
                <button 
                  onClick={onBack} 
                  className="p-2 bg-white/10 rounded-full hover:bg-[#FFD700] hover:text-black transition duration-300 backdrop-blur-md border border-white/10"
                  title="Retour à l'Arène"
                >
                    <ArrowLeft size={18} />
                </button>
            )}
            
            {/* LOGO */}
            <div 
              className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-1 cursor-pointer" 
              onClick={() => scrollToSection('hero')}
            >
              <span className="text-[#FFD700] drop-shadow-md font-serif italic">{hero.title?.split(' ')[0] || 'MY'}</span>
              <span className="text-white uppercase tracking-widest text-sm md:text-base ml-1">{hero.title?.split(' ').slice(1).join(' ') || 'FOLIO'}</span>
            </div>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-8">
          {['ACCUEIL', 'BIO', 'SERVICES', 'RÉALISATIONS', 'CONTACT'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item === 'ACCUEIL' ? 'hero' : item.toLowerCase().replace('é', 'e'))}
              className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#FFD700] transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          >
             {['ACCUEIL', 'BIO', 'SERVICES', 'RÉALISATIONS', 'CONTACT'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item === 'ACCUEIL' ? 'hero' : item.toLowerCase().replace('é', 'e'))}
                className="text-2xl font-serif font-bold text-white hover:text-[#FFD700] transition-colors"
              >
                {item}
              </button>
            ))}
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 text-white p-2">
                <CloseIcon size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );

  const Lightbox = () => (
    <AnimatePresence>
      {lightboxImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition">
            <CloseIcon size={40} />
          </button>
          <motion.img 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={lightboxImage} 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl border border-white/10 rounded-sm"
            alt="Full screen"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // --- SECTIONS ---

  return (
    <div className={`${styles.bg} ${styles.text} ${styles.font} selection:${styles.buttonBg} selection:${styles.buttonText} overflow-x-hidden min-h-screen`}>
      {isIsolated && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-1.5 text-xs font-bold z-[100] uppercase tracking-widest shadow-lg">
          MODE SITE ISOLÉ ACTIVÉ - PRESTATAIRE : {creatorName}
        </div>
      )}
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      <SEO 
        title={`${hero.title || 'Artiste'} | Portfolio Officiel`}
        description={`Découvrez l'univers de ${hero.title || 'ce créatif'}, expert en ${hero.subtitle || 'son domaine'}. Visitez son Empire numérique sur My Folio-Tag.`}
        image={hero.backgroundImage || bio.image}
        type="profile"
      />
      <Navbar />
      <Lightbox />

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${hero.backgroundImage || "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80"})` }}
        ></div>
        <div className="absolute inset-0 bg-black" style={{ opacity: styles.overlayOpacity || 0.7 }}></div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`text-6xl md:text-9xl font-bold text-white mb-4 ${fontSerif} tracking-tighter`}
            >
                {hero.title}
            </motion.h1>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-3xl text-[#FFD700] font-light tracking-[0.2em] uppercase mb-12"
            >
                {hero.subtitle}
            </motion.h2>

            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={() => scrollToSection('portfolio')}
              className={`px-10 py-4 ${styles.buttonBg} ${styles.buttonText} font-bold uppercase tracking-widest transition duration-300 rounded-sm`}
            >
                Voir mes projets
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onClick={handleVCardExport}
              className="px-10 py-4 bg-transparent border border-[#FFD700] text-[#FFD700] font-bold uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition duration-300 rounded-sm flex items-center justify-center gap-2"
            >
                <UserPlus size={16}/> Ajouter aux contacts
            </motion.button>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
        >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* 2. BIO SECTION (Magazine Layout) */}
      <motion.section 
        id="bio" 
        className="py-32 px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
         <div className={`grid grid-cols-1 ${creatorData?.userType === 'enterprise' ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-16 items-center`}>
            {/* Image (Asymétrique) */}
            <div 
              className={`${creatorData?.userType === 'enterprise' ? 'w-full max-w-4xl mx-auto' : 'lg:col-span-5'} relative`}
            >
                <div className={`absolute top-4 -left-4 w-full h-full border-2 ${styles.borderColor} z-0`}></div>
                <div className={`relative z-10 ${creatorData?.userType === 'enterprise' ? 'aspect-video' : 'aspect-[3/4]'} overflow-hidden bg-gray-900 grayscale hover:grayscale-0 transition duration-700`}>
                    <img 
                      src={bio.image || "https://via.placeholder.com/600x800"} 
                      className="w-full h-full object-cover" 
                      alt="Portrait"
                    />
                </div>
            </div>

            {/* Content */}
            <div 
              className={`${creatorData?.userType === 'enterprise' ? 'text-center max-w-4xl mx-auto' : 'lg:col-span-7'}`}
            >
                <h3 className={`${styles.primary} text-sm font-bold uppercase tracking-widest mb-4 flex items-center ${creatorData?.userType === 'enterprise' ? 'justify-center' : ''} gap-2`}>
                   <span className={`w-8 h-px bg-${styles.primary}`}></span> {bio.sectionTitle || (creatorData?.userType === 'enterprise' ? 'Qui sommes-nous ?' : 'À Propos')}
                </h3>
                <h2 className={`text-4xl md:text-6xl font-bold ${styles.text} mb-8 ${fontSerif} leading-tight`}>
                  {bio.headline || (creatorData?.userType === 'enterprise' ? 'L\'excellence au service de votre vision.' : 'Créer avec passion, livrer avec excellence.')}
                </h2>
                
                {creatorData?.userType === 'enterprise' && (
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {creatorData?.foundedYear && (
                      <div className={`px-4 py-2 bg-white/5 border ${styles.borderColor} rounded-full flex items-center gap-2`}>
                        <Calendar size={14} className={styles.primary}/>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Créé en {creatorData.foundedYear}</span>
                      </div>
                    )}
                    {creatorData?.keyFigures && (
                      <div className={`px-4 py-2 bg-white/5 border ${styles.borderColor} rounded-full flex items-center gap-2`}>
                        <Star size={14} className={styles.primary}/>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">{creatorData.keyFigures}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-gray-400 text-lg leading-relaxed space-y-6 mb-12 font-light">
                   <p>{bio.description || "Je suis un visionnaire dédié à transformer vos idées en réalité tangible. Mon approche combine esthétique intemporelle et fonctionnalité moderne."}</p>
                </div>

                {/* Stats (Only for individual or if enterprise has them) */}
                {creatorData?.userType !== 'enterprise' && (
                  <div className={`grid grid-cols-2 gap-8 border-t ${styles.borderColor} pt-8`}>
                      <div>
                          <span className={`block text-5xl font-bold ${styles.text} mb-2 ${fontSerif}`}>{stats.years}+</span>
                          <span className="text-xs text-gray-500 uppercase tracking-widest">Années d'expérience</span>
                      </div>
                      <div>
                          <span className={`block text-5xl font-bold ${styles.text} mb-2 ${fontSerif}`}>{stats.projects}</span>
                          <span className="text-xs text-gray-500 uppercase tracking-widest">Projets Livrés</span>
                      </div>
                  </div>
                )}

                {/* Signature (Only for individual) */}
                {creatorData?.userType !== 'enterprise' && (
                  <div className={`mt-12 font-serif italic text-3xl ${styles.primary} opacity-80`}>
                    {bio.name}
                  </div>
                )}
            </div>
         </div>
      </motion.section>

      {/* 3. SERVICES SECTION */}
      <motion.section 
        id="services" 
        className={`py-32 ${styles.cardBg}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className={`text-4xl md:text-5xl font-bold ${styles.text} mb-4 ${fontSerif}`}>{skillsSection.sectionTitle || 'Ce Que Je Propose'}</h2>
                <div className={`w-24 h-1 bg-${styles.primary} mx-auto`}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {services.map((item: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`group ${styles.cardBg} border ${styles.borderColor} p-8 hover:-translate-y-2 transition-all duration-300 hover:border-${styles.primary} relative overflow-hidden`}
                  >
                      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition`}>
                         <Star size={80} />
                      </div>
                      
                      <div className={`w-12 h-12 bg-${styles.primary}/10 rounded-full flex items-center justify-center ${styles.primary} mb-6 group-hover:bg-${styles.primary} group-hover:text-black transition`}>
                         <CheckCircle size={24} />
                      </div>

                      <h3 className={`text-2xl font-bold ${styles.text} mb-3 ${fontSerif}`}>{item.title || item.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {item.description || "Un service sur-mesure adapté à vos besoins spécifiques."}
                      </p>
                      
                      {item.price && (
                        <div className={`${styles.primary} font-bold text-lg`}>
                           {item.price}
                        </div>
                      )}
                  </div>
               ))}
            </div>
         </div>
      </motion.section>

      {/* 4. ZONE CENTRALE DYNAMIQUE */}
      {(!config.layoutType || config.layoutType === 'GALLERY') && (
        <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                   <h3 className={`${styles.primary} text-sm font-bold uppercase tracking-widest mb-2`}>Portfolio</h3>
                   <h2 className={`text-4xl md:text-5xl font-bold ${styles.text} ${styles.font}`}>{projectsSection.sectionTitle || 'Mes Réalisations'}</h2>
                </div>
                <div className="hidden md:block text-gray-500 text-sm">
                   Une sélection de mes meilleurs travaux
                </div>
            </div>

            {gallery.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                 {gallery.map((img: string, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="break-inside-avoid relative group cursor-zoom-in overflow-hidden"
                      onClick={() => setLightboxImage(img)}
                    >
                        <img src={img} className="w-full object-cover grayscale group-hover:grayscale-0 transition duration-700 transform group-hover:scale-105" alt={`Project ${idx}`} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="text-white uppercase tracking-widest text-xs font-bold border border-white px-4 py-2">Voir</span>
                        </div>
                    </motion.div>
                 ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20 border border-dashed border-white/10">
                 Aucune image dans la galerie pour le moment.
              </div>
            )}
        </section>
      )}

      {config.layoutType === 'CATALOGUE' && (
        <CatalogueLegos items={services} phone={contact.actionValue || contact.phone} title={catalogSection.sectionTitle} />
      )}

      {config.layoutType === 'SERVICES' && (
        <ServicesLegos items={services} phone={contact.actionValue || contact.phone} title={skillsSection.sectionTitle} />
      )}

      <TestimonialsLego items={sections.find(s => s.type === 'testimonials')?.content?.items || []} styles={styles} title={testimonialsSection.sectionTitle} />

      {/* 4.5 PARTNERS SECTION (Enterprise only) */}
      {creatorData?.userType === 'enterprise' && creatorData?.partners && creatorData.partners.length > 0 && (
        <section className="py-20 px-6 bg-white/5 border-y border-white/5">
           <div className="max-w-7xl mx-auto">
              <h3 className="text-center text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-12">{partnersSection.sectionTitle || 'Ils nous font confiance'}</h3>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                 {creatorData.partners.map((partner: any, idx: number) => (
                   <motion.img 
                     key={idx}
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 0.5 }}
                     whileHover={{ opacity: 1, filter: 'grayscale(0)' }}
                     src={partner.logoUrl} 
                     alt={partner.name} 
                     className="h-8 md:h-12 w-auto grayscale transition-all duration-500"
                   />
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* 5. ACTUALITÉS SECTION (Social Wall) */}
      <section id="news" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex items-center gap-4 mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold ${styles.text} ${fontSerif}`}>{socialSection.sectionTitle || 'Actualités'}</h2>
              <div className="h-px flex-grow bg-white/10"></div>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <div key={post.id} className={`group relative overflow-hidden border p-8 transition duration-300 ${styles.cardBg} ${styles.borderColor} hover:border-${styles.primary}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full bg-${styles.primary} transform -translate-y-full group-hover:translate-y-0 transition duration-500`}></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <Sparkles size={16} className={`${styles.primary}`} />
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Récemment'}
                            </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed font-light italic">
                            "{post.content}"
                        </p>

                        {(post.images?.[0] || post.imageUrl) && (
                            <div className={`mt-4 rounded-xl overflow-hidden border ${styles.borderColor}`}>
                                <img 
                                    src={post.images?.[0] || post.imageUrl} 
                                    className="w-full h-48 object-cover hover:scale-105 transition duration-700" 
                                    alt="Post" 
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 border border-dashed ${styles.borderColor} rounded-2xl ${styles.cardBg}`}>
                <div className={`mb-4 ${styles.primary} animate-pulse`}>⏳</div>
                <p className="text-gray-400 font-light italic text-sm">L'Empire n'a pas encore publié d'actualités.</p>
            </div>
          )}
      </section>

      {/* 6. CONTACT & FOOTER */}
      <ContactSection creatorData={creatorData} styles={styles} />

      <RecruitmentSection />
    </div>
  );
};

const ContactSection = ({ creatorData, styles }) => {
  if (!creatorData) return null;

  const labels = creatorData?.labels || {};
  const contact = creatorData?.sections?.find(s => s.type === 'contact')?.content || {};
  const phone = contact.actionValue || contact.phone;

  if (creatorData?.googleFormUrl) {
    return (
      <section id="contact" className={`py-32 ${styles.cardBg}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-6xl font-bold ${styles.text} ${styles.font} mb-8`}>{labels.contact || 'Contactez-moi'}</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe src={creatorData.googleFormUrl} width="100%" height="800" frameBorder="0" marginHeight={0} marginWidth={0}>Chargement…</iframe>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className={`${styles.cardBg} pt-32 pb-10 px-6 border-t ${styles.borderColor}`}>
       <div className="max-w-4xl mx-auto text-center mb-20">
           <h2 className={`text-4xl md:text-6xl font-bold ${styles.text} ${styles.font} mb-8`}>{labels.contact || 'Travaillons Ensemble'}</h2>
           <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
             Vous avez un projet ? Une vision ? Je suis là pour la concrétiser. Contactez-moi dès aujourd'hui.
           </p>
           
           <div className="flex flex-col md:flex-row justify-center gap-6">
              {phone && (
                <>
                  <a 
                    href={generateWhatsAppLink(phone, "votre expertise", "discuter de")} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-8 py-4 ${styles.buttonBg} ${styles.buttonText} font-bold uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2`}
                  >
                    <MessageCircle size={20}/> Discuter sur WhatsApp
                  </a>
                  <a 
                    href={`tel:${phone.replace(/\D/g, '')}`} 
                    className={`px-8 py-4 border ${styles.borderColor} ${styles.primary} font-bold uppercase tracking-widest hover:${styles.buttonBg} hover:${styles.buttonText} transition duration-300 flex items-center justify-center gap-2`}
                  >
                    <Phone size={20}/> Appeler Directement
                  </a>
                </>
              )}
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`} 
                  className={`px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition duration-300 flex items-center justify-center gap-2`}
                >
                  <Mail size={20}/> Envoyer un Email
                </a>
              )}
           </div>

           {creatorData?.userType === 'enterprise' && creatorData?.openingHours && (
             <div className="mt-12 flex items-center justify-center gap-3 text-gray-400">
                <Clock size={18} className={styles.primary}/>
                <span className="text-sm font-medium">Horaires : {creatorData.openingHours}</span>
             </div>
           )}

           {creatorData?.userType === 'enterprise' && creatorData?.legal && (
             <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-[10px] text-gray-600 uppercase tracking-widest border-t border-white/5 pt-8">
                {creatorData.legal.rccm && <div>RCCM: {creatorData.legal.rccm}</div>}
                {creatorData.legal.idNat && <div>ID NAT: {creatorData.legal.idNat}</div>}
                {creatorData.legal.nif && <div>NIF: {creatorData.legal.nif}</div>}
             </div>
           )}
       </div>

       <div className={`max-w-7xl mx-auto border-t ${styles.borderColor} pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600`}>
          <p>&copy; 2026 {creatorData?.name}. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
             Propulsé par <a href="https://my-folio-tag.com" target="_blank" rel="noopener noreferrer" className={`${styles.primary} font-bold`}>My Folio-Tag</a>
          </p>
       </div>
    </section>
  );
};

const RecruitmentSection = () => (
  <section className="bg-black py-8 px-6 text-center border-t border-white/10">
    <p className="text-gray-600 text-xs">
      Propulsé par <a href="https://my-folio-tag.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#FFD700] transition">My Folio-Tag</a> • <a href="https://my-folio-tag.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#FFD700] transition">Créer mon Portfolio</a>
    </p>
  </section>
);

export default PortfolioPreview;