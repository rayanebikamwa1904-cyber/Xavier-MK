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

import { EXCHANGE_RATE } from '../config/constants';

import TestimonialsLegos from './TestimonialsLego';

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

const CatalogueLegos = ({ items, phone }: { items: any[], phone: string }) => {
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
      <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">Catalogue</h3>
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

const ServicesLegos = ({ items, phone }: { items: any[], phone: string }) => (
  <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">Services</h3>
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
}

interface PortfolioPost {
  id: string;
  content: string;
  images?: string[];
  imageUrl?: string;
  createdAt: any;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ config, phone, creatorId, onBack, expiryDate }) => {
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
  const fontSerif = "font-serif";

  // --- COMPONENTS ---

  const Navbar = () => (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}
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
    <div className="bg-[#0d0d0d] text-white font-sans selection:bg-[#FFD700] selection:text-black overflow-x-hidden">
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
        <div className="absolute inset-0 bg-black/70"></div>
        
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
              className="px-10 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest hover:bg-white transition duration-300 rounded-sm"
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
      <section id="bio" className="py-32 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Image (Asymétrique) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 relative"
            >
                <div className="absolute top-4 -left-4 w-full h-full border-2 border-[#FFD700] z-0"></div>
                <div className="relative z-10 aspect-[3/4] overflow-hidden bg-gray-900 grayscale hover:grayscale-0 transition duration-700">
                    <img 
                      src={bio.image || "https://via.placeholder.com/600x800"} 
                      className="w-full h-full object-cover" 
                      alt="Portrait"
                    />
                </div>
            </motion.div>

            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
                <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-8 h-px bg-[#FFD700]"></span> À Propos
                </h3>
                <h2 className={`text-4xl md:text-6xl font-bold text-white mb-8 ${fontSerif} leading-tight`}>
                  Créer avec passion, <br/> livrer avec excellence.
                </h2>
                <div className="text-gray-400 text-lg leading-relaxed space-y-6 mb-12 font-light">
                   <p>{bio.description || "Je suis un visionnaire dédié à transformer vos idées en réalité tangible. Mon approche combine esthétique intemporelle et fonctionnalité moderne."}</p>
                   <p>Chaque détail compte. Dans un monde de bruit, je choisis la clarté et l'impact.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                    <div>
                        <span className={`block text-5xl font-bold text-white mb-2 ${fontSerif}`}>{stats.years}+</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Années d'expérience</span>
                    </div>
                    <div>
                        <span className={`block text-5xl font-bold text-white mb-2 ${fontSerif}`}>{stats.projects}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Projets Livrés</span>
                    </div>
                </div>

                {/* Signature */}
                <div className="mt-12 font-serif italic text-3xl text-[#FFD700] opacity-80">
                  {bio.name}
                </div>
            </motion.div>
         </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-32 bg-[#111]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${fontSerif}`}>Ce Que Je Propose</h2>
                <div className="w-24 h-1 bg-[#FFD700] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {services.map((item: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group bg-[#0d0d0d] border border-white/5 p-8 hover:-translate-y-2 transition-all duration-300 hover:border-[#FFD700]/50 relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                         <Star size={80} />
                      </div>
                      
                      <div className="w-12 h-12 bg-[#FFD700]/10 rounded-full flex items-center justify-center text-[#FFD700] mb-6 group-hover:bg-[#FFD700] group-hover:text-black transition">
                         <CheckCircle size={24} />
                      </div>

                      <h3 className={`text-2xl font-bold text-white mb-3 ${fontSerif}`}>{item.title || item.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {item.description || "Un service sur-mesure adapté à vos besoins spécifiques."}
                      </p>
                      
                      {item.price && (
                        <div className="text-[#FFD700] font-bold text-lg">
                           {item.price}
                        </div>
                      )}
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. ZONE CENTRALE DYNAMIQUE */}
      {(!config.layoutType || config.layoutType === 'GALLERY') && (
        <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                   <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">Portfolio</h3>
                   <h2 className={`text-4xl md:text-5xl font-bold text-white ${fontSerif}`}>Réalisations</h2>
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
        <CatalogueLegos items={services} phone={contact.actionValue || contact.phone} />
      )}

      {config.layoutType === 'SERVICES' && (
        <ServicesLegos items={services} phone={contact.actionValue || contact.phone} />
      )}

      <TestimonialsLegos items={sections.find(s => s.type === 'testimonials')?.content?.items || []} />

      {/* 5. ACTUALITÉS SECTION (Social Wall) */}
      <section id="news" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex items-center gap-4 mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold text-white ${fontSerif}`}>Actualités</h2>
              <div className="h-px flex-grow bg-white/10"></div>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <div key={post.id} className="bg-[#111] border border-white/10 p-8 hover:border-[#FFD700]/30 transition duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700] transform -translate-y-full group-hover:translate-y-0 transition duration-500"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <Sparkles size={16} className="text-[#FFD700]" />
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Récemment'}
                            </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed font-light italic">
                            "{post.content}"
                        </p>

                        {/* IMAGE DU POST */}
                        {(post.images?.[0] || post.imageUrl) && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-[#FFD700]/20">
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
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#FFD700]/30 rounded-2xl bg-[#FFD700]/5">
                <div className="mb-4 text-[#FFD700] animate-pulse">⏳</div>
                <p className="text-gray-400 font-light italic text-sm">L'Empire n'a pas encore publié d'actualités.</p>
            </div>
          )}
      </section>

      {/* 6. CONTACT & FOOTER */}
      <section id="contact" className="bg-[#111] pt-32 pb-10 px-6 border-t border-white/5">
         <div className="max-w-4xl mx-auto text-center mb-20">
             <h2 className={`text-4xl md:text-6xl font-bold text-white mb-8 ${fontSerif}`}>Travaillons Ensemble</h2>
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
                      className="px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest hover:bg-white transition duration-300 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20}/> Discuter sur WhatsApp
                    </a>
                    <a 
                      href={`tel:${phone.replace(/\D/g, '')}`} 
                      className="px-8 py-4 border border-[#FFD700]/30 text-[#FFD700] font-bold uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition duration-300 flex items-center justify-center gap-2"
                    >
                      <Phone size={20}/> Appeler Directement
                    </a>
                  </>
                )}
                {contact.email && (
                  <a 
                    href={`mailto:${contact.email}`} 
                    className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition duration-300 flex items-center justify-center gap-2"
                  >
                    <Mail size={20}/> Envoyer un Email
                  </a>
                )}
             </div>
         </div>

         <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>&copy; 2026 {hero.title}. Tous droits réservés.</p>
            <p className="flex items-center gap-1">
               Propulsé par <span className="text-[#FFD700] font-bold">Hashtag Digital</span>
            </p>
         </div>
      </section>
    </div>
  );
};

export default PortfolioPreview;