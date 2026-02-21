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
  let cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '243' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('243') && cleanPhone.length === 9) {
    cleanPhone = '243' + cleanPhone;
  }

  const message = `Bonjour ! Je vous contacte depuis votre portfolio My Folio-Tag. Je souhaite ${type} : *${itemName}*.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

const CatalogueLegos = ({ items, phone, labels }: { items: any[], phone: string, labels: any }) => {
  const [currency, setCurrency] = useState('USD');

  const convertPrice = (price: string) => {
    if (currency === 'CDF') {
      const priceInUsd = parseFloat(price.replace(/[^0-9.-]+/g, ""));
      if (isNaN(priceInUsd)) return price;
      return `${(priceInUsd * EXCHANGE_RATE).toLocaleString('fr-FR')} CDF`;
    }
    return price;
  };

  if (!items || items.length === 0) return null;

  return (
  <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      {labels?.catalogueSubtitle && <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">{labels.catalogueSubtitle}</h3>}
      {labels?.catalogueTitle && <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">{labels.catalogueTitle}</h2>}
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
          {item.images?.[0] && (
            <div className="h-64 bg-gray-900 relative overflow-hidden">
              <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.title} />
              {item.price && (
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[#FFD700] font-bold text-sm">
                  {convertPrice(item.price)}
                </div>
              )}
            </div>
          )}
          <div className="p-6">
            {item.title && <h3 className="text-xl font-bold text-white mb-2 font-serif">{item.title}</h3>}
            {item.description && <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>}
            {phone ? (
              <a 
                href={generateWhatsAppLink(phone, item.title || 'cet article', 'commander')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={14} /> {labels?.orderButton || 'Commander'}
              </a>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
)};

const ServicesLegos = ({ items, phone, labels }: { items: any[], phone: string, labels: any }) => {
  if (!items || items.length === 0) return null;

  return (
  <section id="services" className="py-32 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      {labels?.servicesSubtitle && <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">{labels.servicesSubtitle}</h3>}
      {labels?.servicesTitle && <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">{labels.servicesTitle}</h2>}
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
            {item.title && <h3 className="text-2xl font-bold text-white mb-2 font-serif group-hover:text-[#FFD700] transition">{item.title}</h3>}
            {item.description && <p className="text-gray-400 text-sm max-w-2xl">{item.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-3">
            {item.price && <div className="text-2xl font-black text-white">{item.price}</div>}
            {phone ? (
              <a 
                href={generateWhatsAppLink(phone, item.title || 'ce service', 'réserver')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#FFD700] text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition flex items-center gap-2"
              >
                <Calendar size={14} /> {labels?.reserveButton || 'Réserver'}
              </a>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
)};

interface PortfolioPreviewProps {
  config: PortfolioConfig;
  phone?: string;
  creatorId?: string;
  isMobileView?: boolean;
  onBack?: () => void;
  expiryDate?: string;
  creatorData?: any; 
}

interface PortfolioPost {
  id: string;
  content: string;
  images?: string[];
  imageUrl?: string;
  createdAt: any;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ config, phone, creatorId, onBack, expiryDate, creatorData }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<PortfolioPost[]>([]);

  // EXTRACTION STRICTE DES DONNÉES (Zéro Simulation)
  const sections = config.sections || [];
  const hero = sections.find(s => s.type === 'hero')?.content || {};
  const bio = sections.find(s => s.type === 'bio')?.content || {};
  const contact = sections.find(s => s.type === 'contact')?.content || {};
  const services = sections.find(s => s.type === 'services')?.content?.items || [];
  const gallery = sections.find(s => s.type === 'gallery')?.content?.images || [];
  const testimonials = sections.find(s => s.type === 'testimonials')?.content?.items || [];
  
  // Stats strictement liées aux données entrées
  const stats = bio.stats;
  // Labels dynamiques récupérés du profil
  const labels = creatorData?.labels || config.labels || {};

  const handleVCardExport = () => {
    const card = new vCard();
    if (hero.title) card.add('fn', hero.title);
    if (phone) card.add('tel', phone, { type: 'work' });
    card.add('url', window.location.href);

    const cardData = card.toString();
    const blob = new Blob([cardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${hero.title || 'Contact'}.vcf`;
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

  // --- LIVE POSTS SYNC ---
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

  const fontSerif = "font-serif";

  // --- COMPONENTS ---

  const Navbar = () => {
    // Ne générer le menu que pour les sections qui existent vraiment
    const menuItems = [];
    if (hero.title || hero.subtitle || hero.backgroundImage) menuItems.push({ label: labels?.navHome || 'ACCUEIL', id: 'hero' });
    if (bio.description || bio.image) menuItems.push({ label: labels?.navBio || 'BIO', id: 'bio' });
    if (services.length > 0) menuItems.push({ label: labels?.navServices || 'SERVICES', id: 'services' });
    if (gallery.length > 0) menuItems.push({ label: labels?.navGallery || 'PORTFOLIO', id: 'portfolio' });
    if (phone || contact.email) menuItems.push({ label: labels?.navContact || 'CONTACT', id: 'contact' });

    return (
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
                    title="Retour"
                  >
                      <ArrowLeft size={18} />
                  </button>
              )}
              
              {hero.title && (
                <div 
                  className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-1 cursor-pointer" 
                  onClick={() => scrollToSection('hero')}
                >
                  <span className="text-[#FFD700] drop-shadow-md font-serif italic">{hero.title.split(' ')[0]}</span>
                  <span className="text-white uppercase tracking-widest text-sm md:text-base ml-1">{hero.title.split(' ').slice(1).join(' ')}</span>
                </div>
              )}
          </div>

          <div className="hidden md:flex gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#FFD700] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {menuItems.length > 0 && (
            <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <CloseIcon /> : <Menu />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 md:hidden"
            >
               {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-2xl font-serif font-bold text-white hover:text-[#FFD700] transition-colors"
                >
                  {item.label}
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
  };

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

  return (
    <div className="bg-[#0d0d0d] text-white font-sans selection:bg-[#FFD700] selection:text-black overflow-x-hidden">
      <SEO 
        title={hero.title ? `${hero.title} | Portfolio Officiel` : 'Portfolio'}
        description={bio.description || ''}
        image={hero.backgroundImage || bio.image}
        type="profile"
      />
      <Navbar />
      <Lightbox />

      {/* 1. HERO SECTION (Ne s'affiche que si des données existent) */}
      {(hero.title || hero.subtitle || hero.backgroundImage) && (
        <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          {hero.backgroundImage && (
            <div 
                className="absolute inset-0 bg-cover bg-center bg-fixed"
                style={{ backgroundImage: `url(${hero.backgroundImage})` }}
            ></div>
          )}
          <div className="absolute inset-0 bg-black/70"></div>
          
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
              {hero.title && (
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`text-6xl md:text-9xl font-bold text-white mb-4 ${fontSerif} tracking-tighter`}
                >
                    {hero.title}
                </motion.h1>
              )}
              
              {hero.subtitle && (
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="text-xl md:text-3xl text-[#FFD700] font-light tracking-[0.2em] uppercase mb-12"
                >
                    {hero.subtitle}
                </motion.h2>
              )}

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
                {gallery.length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    onClick={() => scrollToSection('portfolio')}
                    className="px-10 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest hover:bg-white transition duration-300 rounded-sm"
                  >
                      {labels?.heroButton1 || 'Voir mes projets'}
                  </motion.button>
                )}
                {hero.title && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    onClick={handleVCardExport}
                    className="px-10 py-4 bg-transparent border border-[#FFD700] text-[#FFD700] font-bold uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition duration-300 rounded-sm flex items-center justify-center gap-2"
                  >
                      <UserPlus size={16}/> {labels?.heroButton2 || 'Ajouter aux contacts'}
                  </motion.button>
                )}
              </div>
          </div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
          >
              <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
          </motion.div>
        </section>
      )}

      {/* 2. BIO SECTION */}
      {(bio.description || bio.image || stats) && (
        <section id="bio" className="py-32 px-6 max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Image */}
              {bio.image ? (
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
                          src={bio.image} 
                          className="w-full h-full object-cover" 
                          alt={bio.name || "Portrait"}
                        />
                    </div>
                </motion.div>
              ) : (
                <div className="lg:col-span-5 hidden lg:block"></div>
              )}

              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={bio.image ? "lg:col-span-7" : "lg:col-span-12"}
              >
                  {labels?.bioSubtitle && (
                    <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-8 h-px bg-[#FFD700]"></span> {labels.bioSubtitle}
                    </h3>
                  )}
                  {labels?.bioTitle && (
                    <h2 className={`text-4xl md:text-6xl font-bold text-white mb-8 ${fontSerif} leading-tight`}>
                      {labels.bioTitle}
                    </h2>
                  )}
                  
                  {bio.description && (
                    <div className="text-gray-400 text-lg leading-relaxed space-y-6 mb-12 font-light whitespace-pre-line">
                       {bio.description}
                    </div>
                  )}

                  {/* Stats dynamiques */}
                  {stats && (stats.years || stats.projects) && (
                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                        {stats.years && (
                          <div>
                              <span className={`block text-5xl font-bold text-white mb-2 ${fontSerif}`}>{stats.years}</span>
                              {labels?.stat1 && <span className="text-xs text-gray-500 uppercase tracking-widest">{labels.stat1}</span>}
                          </div>
                        )}
                        {stats.projects && (
                          <div>
                              <span className={`block text-5xl font-bold text-white mb-2 ${fontSerif}`}>{stats.projects}</span>
                              {labels?.stat2 && <span className="text-xs text-gray-500 uppercase tracking-widest">{labels.stat2}</span>}
                          </div>
                        )}
                    </div>
                  )}

                  {bio.name && (
                    <div className="mt-12 font-serif italic text-3xl text-[#FFD700] opacity-80">
                      {bio.name}
                    </div>
                  )}
              </motion.div>
           </div>
        </section>
      )}

      {/* 3. SERVICES (Si layout global ou spécifié) */}
      {(!config.layoutType || config.layoutType === 'GALLERY') && services.length > 0 && (
        <section id="services" className="py-32 bg-[#111]">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  {labels?.servicesTitle && <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${fontSerif}`}>{labels.servicesTitle}</h2>}
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

                        {item.title && <h3 className={`text-2xl font-bold text-white mb-3 ${fontSerif}`}>{item.title}</h3>}
                        {item.description && <p className="text-gray-400 text-sm leading-relaxed mb-6">{item.description}</p>}
                        
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
      )}

      {/* 4. ZONE CENTRALE DYNAMIQUE (Galerie) */}
      {(!config.layoutType || config.layoutType === 'GALLERY') && gallery.length > 0 && (
        <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                   {labels?.gallerySubtitle && <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">{labels.gallerySubtitle}</h3>}
                   {labels?.galleryTitle && <h2 className={`text-4xl md:text-5xl font-bold text-white ${fontSerif}`}>{labels.galleryTitle}</h2>}
                </div>
            </div>

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
        </section>
      )}

      {/* Variantes Layouts */}
      {config.layoutType === 'CATALOGUE' && (
        <CatalogueLegos items={services} phone={contact.actionValue || contact.phone || phone} labels={labels} />
      )}

      {config.layoutType === 'SERVICES' && (
        <ServicesLegos items={services} phone={contact.actionValue || contact.phone || phone} labels={labels} />
      )}

      {/* 5. TÉMOIGNAGES */}
      {testimonials.length > 0 && (
        <TestimonialsLegos items={testimonials} />
      )}

      {/* 6. ACTUALITÉS (Disparaît si aucun post) */}
      {posts.length > 0 && (
        <section id="news" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
            <div className="flex items-center gap-4 mb-16">
                <h2 className={`text-3xl md:text-4xl font-bold text-white ${fontSerif}`}>{labels?.newsTitle || 'Actualités'}</h2>
                <div className="h-px flex-grow bg-white/10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <div key={post.id} className="bg-[#111] border border-white/10 p-8 hover:border-[#FFD700]/30 transition duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700] transform -translate-y-full group-hover:translate-y-0 transition duration-500"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <Sparkles size={16} className="text-[#FFD700]" />
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : ''}
                            </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed font-light italic">
                            "{post.content}"
                        </p>

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
        </section>
      )}

      {/* 7. CONTACT & FOOTER (Disparaît s'il n'y a ni titre, ni description, ni téléphone, ni email) */}
      {(contact.title || contact.description || phone || contact.email) && (
        <section id="contact" className="bg-[#111] pt-32 pb-10 px-6 border-t border-white/5">
           <div className="max-w-4xl mx-auto text-center mb-20">
               {contact.title && <h2 className={`text-4xl md:text-6xl font-bold text-white mb-8 ${fontSerif}`}>{contact.title}</h2>}
               {contact.description && (
                 <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
                   {contact.description}
                 </p>
               )}
               
               <div className="flex flex-col md:flex-row justify-center gap-6">
                  {phone && (
                    <>
                      <a 
                        href={generateWhatsAppLink(phone, hero.title || "vos services", "discuter de")} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest hover:bg-white transition duration-300 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={20}/> {labels?.whatsappBtn || 'WhatsApp'}
                      </a>
                      <a 
                        href={`tel:${phone.replace(/\D/g, '')}`} 
                        className="px-8 py-4 border border-[#FFD700]/30 text-[#FFD700] font-bold uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition duration-300 flex items-center justify-center gap-2"
                      >
                        <Phone size={20}/> {labels?.callBtn || 'Appeler'}
                      </a>
                    </>
                  )}
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition duration-300 flex items-center justify-center gap-2"
                    >
                      <Mail size={20}/> {labels?.emailBtn || 'Email'}
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
      )}
    </div>
  );
};

export default PortfolioPreview;
