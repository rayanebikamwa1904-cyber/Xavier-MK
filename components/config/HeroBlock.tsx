import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const HeroBlock = ({ hero, styles, fontSerif, scrollToSection, handleVCardExport, parallaxY, theme }: any) => {
  return (
    <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
              backgroundImage: `url(${hero.backgroundImage || "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80"})`,
              y: parallaxY
          }}
      ></motion.div>
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
  );
};

export default HeroBlock;
