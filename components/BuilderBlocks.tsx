import React from 'react';
import { Mail, Phone, ArrowRight, Star, MapPin, MessageCircle, Heart, Share2, MoreHorizontal, Calendar, ExternalLink, Play, Upload, Image as ImageIcon, ShoppingBag, Utensils } from 'lucide-react';
import { PortfolioTheme } from '../types';
import { EditableText, EditableImage, EditableList } from './ui/Editable';

interface BlockProps {
  content: any;
  theme: PortfolioTheme;
  onUpdate?: (newContent: any) => void;
  readOnly?: boolean;
}

// --- UTILITAIRES DE STYLE ---
const getThemeClasses = (theme: PortfolioTheme) => {
  const base = "transition-all duration-500";
  const radius = theme.style === 'elegant' ? 'rounded-2xl' : 'rounded-none';
  const font = theme.font || (theme.style === 'elegant' ? 'font-serif' : theme.style === 'tech' ? 'font-mono' : 'font-sans');
  return { radius, font, base };
};

// --- 1. HERO BLOCK ---
export const HeroBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { font } = getThemeClasses(theme);
  const layout = theme.layout || 'imperial'; 

  const handleChange = (key: string, val: any) => {
    if (onUpdate) onUpdate({ ...content, [key]: val });
  };

  // Common inner content for multiple layouts
  const renderHeroContent = () => (
    <>
      <EditableText
          tag="h1"
          className="text-6xl md:text-9xl font-bold text-white mb-6 leading-none tracking-tighter drop-shadow-2xl relative z-10"
          value={content.title}
          onChange={(val) => handleChange('title', val)}
          placeholder="Votre Titre"
          readOnly={readOnly}
      />
      <EditableText
          tag="p"
          className="text-xl text-gray-200 mb-10 font-light italic max-w-2xl mx-auto relative z-10"
          value={content.subtitle}
          onChange={(val) => handleChange('subtitle', val)}
          placeholder="Votre sous-titre"
          readOnly={readOnly}
      />
      <button className={`${theme.primaryColor.replace('text', 'bg')} text-black px-12 py-5 text-lg font-bold rounded-full hover:scale-105 transition shadow-glow relative z-10`}>
           <EditableText
             tag="span"
             value={content.buttonText}
             onChange={(val) => handleChange('buttonText', val)}
             placeholder="Bouton"
             readOnly={readOnly}
           />
      </button>
    </>
  );

  // VERSION 1 : IMPÉRIAL
  if (layout === 'imperial') {
    return (
      <div className={`relative h-screen flex items-center justify-center overflow-hidden ${font}`}>
        <div className="absolute inset-0 z-0">
          <EditableImage 
             src={content.backgroundImage} 
             onChange={(url) => handleChange('backgroundImage', url)} 
             className="w-full h-full object-cover animate-pulse-slow"
             readOnly={readOnly}
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
          <div className={`absolute inset-0 opacity-20 mix-blend-overlay ${theme.primaryColor.replace('text', 'bg')} pointer-events-none`}></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full bg-black/50 backdrop-blur-md shadow-glow">
             <Star size={14} className="text-yellow-400 fill-yellow-400 animate-spin-slow"/> 
             <span className="text-xs tracking-[0.2em] text-white uppercase font-bold">Portfolio Premium</span>
          </div>
          {renderHeroContent()}
        </div>
      </div>
    );
  }

  // VERSION 2 : SPLIT
  if (layout === 'split') {
    return (
      <div className={`min-h-[90vh] flex flex-col md:flex-row bg-black/80 backdrop-blur-sm ${font}`}>
        <div className="flex-1 flex flex-col justify-center p-12 md:p-24 relative z-10">
           <span className={`text-sm uppercase tracking-widest mb-4 font-bold ${theme.primaryColor}`}>Bienvenue chez</span>
           <EditableText
             tag="h1"
             className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
             value={content.title}
             onChange={(val) => handleChange('title', val)}
             readOnly={readOnly}
           />
           <EditableText
             tag="p"
             className="text-gray-400 text-lg mb-8 max-w-md"
             value={content.subtitle}
             onChange={(val) => handleChange('subtitle', val)}
             readOnly={readOnly}
           />
           <div className="flex gap-4">
             <button className={`${theme.primaryColor.replace('text', 'bg')} text-black px-8 py-4 rounded font-bold hover:opacity-90`}>
                <EditableText
                    tag="span"
                    value={content.buttonText || "Découvrir"}
                    onChange={(val) => handleChange('buttonText', val)}
                    readOnly={readOnly}
                />
             </button>
           </div>
        </div>
        <div className="flex-1 relative min-h-[50vh] md:h-auto">
           <EditableImage 
             src={content.backgroundImage} 
             onChange={(url) => handleChange('backgroundImage', url)} 
             className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition duration-1000"
             readOnly={readOnly}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  }

  // VERSION 3 : MINIMAL
  return (
    <div className={`min-h-[80vh] flex flex-col justify-end pb-24 px-6 relative ${font}`}>
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-[100px]"></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 ${theme.primaryColor.replace('text', 'bg')}/10 rounded-full blur-[120px]`}></div>
        
        <div className="max-w-7xl mx-auto w-full border-t border-white/10 pt-10 animate-fade-in relative z-10">
            <EditableText
                tag="h1"
                className="text-[10vw] font-bold text-white leading-[0.8] mb-8 tracking-tighter opacity-90 break-words"
                value={content.title ? content.title.toUpperCase() : "TITRE"}
                onChange={(val) => handleChange('title', val)}
                readOnly={readOnly}
            />
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <EditableText
                    tag="p"
                    className="text-2xl text-gray-500 max-w-xl"
                    value={content.subtitle}
                    onChange={(val) => handleChange('subtitle', val)}
                    readOnly={readOnly}
                />
                <button className="flex items-center gap-4 text-white hover:gap-6 transition-all group">
                    <span className={`w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white group-hover:bg-white/5`}>
                        <ArrowRight className="text-white" />
                    </span>
                    <span className="text-xl uppercase tracking-widest font-bold text-white">Entrer</span>
                </button>
            </div>
        </div>
    </div>
  );
};

// --- 2. COMMERCE & SERVICES BLOCK (MULTI-MODES) ---
export const ServicesBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { radius, font } = getThemeClasses(theme);
  
  // layoutType détermine le mode: 'services' (défaut), 'catalog' (E-commerce), 'restaurant' (Menu)
  const layoutType = content.layoutType || 'services';

  const handleItemChange = (index: number, key: string, val: string) => {
    if (!onUpdate) return;
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], [key]: val };
    onUpdate({ ...content, items: newItems });
  };

  const handleAdd = () => {
    if (!onUpdate) return;
    const newItems = [...(content.items || []), { 
      name: "Nouvel Article", 
      price: "0$", 
      description: "Description...", 
      image: "https://via.placeholder.com/400" 
    }];
    onUpdate({ ...content, items: newItems });
  };

  const handleRemove = (index: number) => {
    if (!onUpdate) return;
    const newItems = content.items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...content, items: newItems });
  };

  // MODE 1 : CATALOGUE E-COMMERCE
  if (layoutType === 'catalog') {
    return (
      <div className={`py-24 px-6 relative z-10 ${font}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <ShoppingBag size={40} className={`mx-auto mb-4 ${theme.primaryColor}`} />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Notre Boutique</h2>
            <div className={`h-1 w-24 mx-auto ${theme.primaryColor.replace('text', 'bg')}`}></div>
          </div>

          <EditableList
              items={content.items}
              onItemAdd={onUpdate ? handleAdd : undefined}
              onItemRemove={onUpdate ? handleRemove : undefined}
              readOnly={readOnly}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              renderItem={(item, index) => (
                  <div key={index} className={`bg-[#111] border border-white/5 overflow-hidden group hover:border-white/30 transition duration-500 ${radius}`}>
                    <div className="h-64 bg-gray-900 relative overflow-hidden">
                      <EditableImage 
                        src={item.image || "https://via.placeholder.com/400"} 
                        onChange={(url) => handleItemChange(index, 'image', url)} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                        readOnly={readOnly} 
                      />
                      <div className={`absolute top-4 right-4 bg-black/80 px-3 py-1 rounded-full border border-white/10 font-bold text-sm ${theme.primaryColor}`}>
                        <EditableText 
                          tag="span" 
                          value={item.price} 
                          onChange={(val) => handleItemChange(index, 'price', val)} 
                          readOnly={readOnly} 
                        />
                      </div>
                    </div>
                    <div className="p-6">
                      <EditableText 
                        tag="h3" 
                        className="text-xl font-bold text-white mb-2" 
                        value={item.name} 
                        onChange={(val) => handleItemChange(index, 'name', val)} 
                        readOnly={readOnly} 
                      />
                      <EditableText 
                        tag="p" 
                        className="text-gray-500 text-sm mb-6" 
                        value={item.description} 
                        onChange={(val) => handleItemChange(index, 'description', val)} 
                        readOnly={readOnly} 
                      />
                    </div>
                  </div>
              )}
          />
        </div>
      </div>
    );
  }

  // MODE 2 : MENU RESTAURANT
  if (layoutType === 'restaurant') {
    return (
      <div className={`py-24 px-6 relative z-10 ${font}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Utensils size={40} className={`mx-auto mb-4 ${theme.primaryColor}`} />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Notre Menu</h2>
            <div className={`h-1 w-24 mx-auto ${theme.primaryColor.replace('text', 'bg')}`}></div>
          </div>

          <EditableList
              items={content.items}
              onItemAdd={onUpdate ? handleAdd : undefined}
              onItemRemove={onUpdate ? handleRemove : undefined}
              readOnly={readOnly}
              className="space-y-6"
              renderItem={(item, index) => (
                  <div key={index} className="flex justify-between items-end border-b border-white/10 pb-4 group">
                    <div className="flex-1 pr-4">
                      <EditableText 
                        tag="h3" 
                        className={`text-xl font-bold text-white mb-1 group-hover:${theme.primaryColor} transition`} 
                        value={item.name} 
                        onChange={(val) => handleItemChange(index, 'name', val)} 
                        readOnly={readOnly} 
                      />
                      <EditableText 
                        tag="p" 
                        className="text-gray-400 text-sm italic" 
                        value={item.description} 
                        onChange={(val) => handleItemChange(index, 'description', val)} 
                        readOnly={readOnly} 
                      />
                    </div>
                    <div className={`text-xl font-bold ${theme.primaryColor}`}>
                      <EditableText 
                        tag="span" 
                        value={item.price} 
                        onChange={(val) => handleItemChange(index, 'price', val)} 
                        readOnly={readOnly} 
                      />
                    </div>
                  </div>
              )}
          />
        </div>
      </div>
    );
  }

  // MODE 3 : SERVICES CLASSIQUES (Défaut)
  return (
    <div className={`py-24 px-6 relative z-10 ${font}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Nos Services</h2>
          <div className={`h-1 w-24 mx-auto ${theme.primaryColor.replace('text', 'bg')}`}></div>
        </div>

        <EditableList
            items={content.items}
            onItemAdd={onUpdate ? handleAdd : undefined}
            onItemRemove={onUpdate ? handleRemove : undefined}
            readOnly={readOnly}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            renderItem={(item, index) => (
                <div key={index} className={`
                  group relative p-8 bg-white/5 border border-white/10 
                  hover:bg-white/10 transition-all duration-500 ${radius} overflow-hidden backdrop-blur-md
                `}>
                  <div className={`w-12 h-12 mb-6 flex items-center justify-center text-white bg-black/50 border border-white/10 ${radius}`}>
                    <Star size={20} className={theme.primaryColor.replace('text-', 'text-')} />
                  </div>
                  
                  <EditableText
                      tag="h3"
                      className="text-2xl font-bold text-white mb-3"
                      value={item.name}
                      onChange={(val) => handleItemChange(index, 'name', val)}
                      readOnly={readOnly}
                  />
                  
                  <div className="text-gray-400 mb-6 text-sm leading-relaxed">
                       <EditableText
                          tag="p"
                          value={item.description || "Description du service..."}
                          onChange={(val) => handleItemChange(index, 'description', val)}
                          readOnly={readOnly}
                      />
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-white/10">
                    <EditableText
                        tag="span"
                        className={`text-xl font-bold ${theme.primaryColor}`}
                        value={item.price}
                        onChange={(val) => handleItemChange(index, 'price', val)}
                        readOnly={readOnly}
                    />
                    <ArrowRight size={20} className="text-white group-hover:translate-x-2 transition" />
                  </div>
                </div>
            )}
        />
      </div>
    </div>
  );
};

// --- 3. GALERIE BLOCK ---
export const GalleryBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { radius, font } = getThemeClasses(theme);
  
  const handleImageChange = (index: number, val: string) => {
      if(!onUpdate) return;
      const newImages = [...content.images];
      newImages[index] = val;
      onUpdate({ ...content, images: newImages });
  }

  const handleAdd = () => {
    if(!onUpdate) return;
    onUpdate({ ...content, images: [...content.images, "https://via.placeholder.com/300"] });
  };

  const handleRemove = (index: number) => {
    if(!onUpdate) return;
    onUpdate({ ...content, images: content.images.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className={`py-20 px-4 bg-black/20 backdrop-blur-sm ${font}`}>
      <h2 className="text-3xl font-bold text-center mb-10 text-white">
        Mes Réalisations
      </h2>
      <EditableList
        items={content.images}
        onItemAdd={onUpdate ? handleAdd : undefined}
        onItemRemove={onUpdate ? handleRemove : undefined}
        readOnly={readOnly}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto"
        renderItem={(img, idx) => (
            <div key={idx} className={`relative group overflow-hidden aspect-square ${radius} border border-white/10`}>
                <EditableImage 
                    src={img}
                    onChange={(val) => handleImageChange(idx, val)}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                    alt={`Projet ${idx}`}
                    readOnly={readOnly}
                />
                {!onUpdate && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                        <span className="text-white text-sm font-bold tracking-widest">ZOOM</span>
                    </div>
                )}
            </div>
        )}
      />
    </div>
  );
};

// --- 4. BIO BLOCK ---
export const BioBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { radius, font } = getThemeClasses(theme);

  const handleChange = (key: string, val: any) => {
    if (onUpdate) onUpdate({ ...content, [key]: val });
  };

  return (
    <div className={`py-24 px-6 ${font} relative overflow-hidden z-10`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 relative w-full max-w-md aspect-[3/4]">
           <div className={`absolute -inset-4 bg-gradient-to-br from-white/20 to-transparent blur-xl rounded-full opacity-50`}></div>
           <div className={`relative h-full w-full overflow-hidden ${radius} border border-white/10 shadow-2xl group`}>
             <EditableImage 
                 src={content.image}
                 onChange={(url) => handleChange('image', url)}
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" 
                 alt="Portrait" 
                 readOnly={readOnly}
             />
             <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-4 pointer-events-none">
                <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Statut</p>
                    <p className="text-white text-xs font-bold">Disponible</p>
                </div>
             </div>
           </div>
        </div>

        <div className="flex-1 space-y-8 text-left">
           <EditableText
              tag="h2"
              className="text-4xl md:text-5xl font-bold text-white leading-tight"
              value={content.headline}
              onChange={(val) => handleChange('headline', val)}
              placeholder="Votre Titre"
              readOnly={readOnly}
           />
           <button className={`w-full flex items-center gap-4 p-4 bg-black/50 border border-white/10 ${radius} hover:bg-white/10 transition group`}>
              <div className={`w-12 h-12 rounded-full ${theme.primaryColor.replace('text', 'bg')} flex items-center justify-center text-black group-hover:scale-110 transition`}>
                 <Play fill="black" size={20} className="ml-1 text-black"/>
              </div>
              <div className="flex-1 text-left">
                 <p className="text-xs text-gray-400 uppercase mb-1">Message Vocal</p>
                 <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-white group-hover:w-2/3 transition-all duration-1000"></div>
                 </div>
              </div>
              <span className="text-xs text-white font-mono">0:45</span>
           </button>
           <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
             <EditableText
                tag="div"
                multiline
                value={content.description}
                onChange={(val) => handleChange('description', val)}
                placeholder="Votre bio..."
                readOnly={readOnly}
             />
           </div>
           
           <div className="font-hand text-5xl text-gray-500 pt-4 opacity-80">
                <EditableText
                    tag="div"
                    value={content.signature || content.name}
                    onChange={(val) => handleChange('signature', val)}
                    placeholder="Signature"
                    readOnly={readOnly}
                />
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. EXPERIENCE BLOCK ---
export const ExperienceBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { font } = getThemeClasses(theme);

  const handleItemChange = (index: number, key: string, val: string) => {
    if (!onUpdate) return;
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], [key]: val };
    onUpdate({ ...content, items: newItems });
  };

  const handleAdd = () => {
    if(!onUpdate) return;
    const newItems = [...(content.items || []), { role: "Rôle", company: "Entreprise", year: "2023", desc: "Description" }];
    onUpdate({ ...content, items: newItems });
  };

  const handleRemove = (index: number) => {
    if(!onUpdate) return;
    onUpdate({ ...content, items: content.items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className={`py-24 px-6 bg-black/50 backdrop-blur ${font}`}>
      <h2 className="text-3xl font-bold text-center text-white mb-16">Mon Parcours</h2>
      <div className="max-w-3xl mx-auto space-y-8 border-l border-white/10 pl-8 relative">
        <EditableList
            items={content.items}
            onItemAdd={onUpdate ? handleAdd : undefined}
            onItemRemove={onUpdate ? handleRemove : undefined}
            readOnly={readOnly}
            renderItem={(xp, i) => (
                <div key={i} className="relative">
                    <div className={`absolute -left-[39px] top-1 w-5 h-5 rounded-full ${theme.primaryColor.replace('text', 'bg')} border-4 border-black`}></div>
                    <EditableText
                        tag="h3"
                        className="text-xl font-bold text-white"
                        value={xp.role}
                        onChange={(val) => handleItemChange(i, 'role', val)}
                        placeholder="Rôle"
                        readOnly={readOnly}
                    />
                    <div className={`${theme.primaryColor} text-sm font-mono mb-2 flex gap-2`}>
                        <EditableText value={xp.year} onChange={(val) => handleItemChange(i, 'year', val)} placeholder="Année" readOnly={readOnly} />
                        <span>•</span>
                        <EditableText value={xp.company} onChange={(val) => handleItemChange(i, 'company', val)} placeholder="Entreprise" readOnly={readOnly} />
                    </div>
                    <div className="text-gray-400">
                         <EditableText value={xp.desc} onChange={(val) => handleItemChange(i, 'desc', val)} placeholder="Description" multiline readOnly={readOnly} />
                    </div>
                </div>
            )}
        />
      </div>
    </div>
  );
};

// --- 6. LE MUR SOCIAL ---
export const SocialWallBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { radius, font } = getThemeClasses(theme);

  const handlePostChange = (index: number, key: string, val: any) => {
    if (!onUpdate) return;
    const newPosts = [...content.posts];
    newPosts[index] = { ...newPosts[index], [key]: val };
    onUpdate({ ...content, posts: newPosts });
  };

  const handleAddPost = () => {
    if (!onUpdate) return;
    const newPosts = [{ text: "Nouveau post...", likes: 0, comments: 0, timeAgo: "A l'instant" }, ...(content.posts || [])];
    onUpdate({ ...content, posts: newPosts });
  };

  const handleRemovePost = (index: number) => {
      if (!onUpdate) return;
      onUpdate({ ...content, posts: content.posts.filter((_: any, i: number) => i !== index) });
  };
  
  return (
    <div className={`py-20 px-4 ${font} relative z-10`}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Mon Actualité
        </h2>

        {/* Zone de "Nouveau Post" */}
        <div className={`mb-10 p-4 bg-black/60 border border-white/10 ${radius} flex gap-4 items-center`}>
            <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-black overflow-hidden`}>
                {content.userAvatar ? <img src={content.userAvatar} className="w-full h-full object-cover"/> : "Moi"}
            </div>
            <input type="text" placeholder="Quoi de neuf aujourd'hui ?" className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500" readOnly={readOnly} />
            {!readOnly && <ImageIcon size={20} className="text-white cursor-pointer hover:text-gray-300" onClick={onUpdate ? handleAddPost : undefined}/>}
        </div>

        {/* Le Fil des Posts */}
        <EditableList
            items={content.posts}
            onItemRemove={onUpdate ? handleRemovePost : undefined}
            readOnly={readOnly}
            className="space-y-8"
            renderItem={(post, i) => (
                <div key={i} className={`bg-black/60 backdrop-blur-md border border-white/10 ${radius} overflow-hidden hover:border-white/30 transition duration-500`}>
                    
                    {/* Header du Post */}
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full object-cover border border-white/20 overflow-hidden">
                                <EditableImage src={content.userAvatar || "https://via.placeholder.com/150"} onChange={onUpdate ? (url) => onUpdate({...content, userAvatar: url}) : undefined} readOnly={readOnly} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">
                                    <EditableText value={content.userName || "Utilisateur"} onChange={onUpdate ? (val) => onUpdate({...content, userName: val}) : undefined} readOnly={readOnly} />
                                </h4>
                                <p className="text-[10px] text-gray-400">{post.timeAgo}</p>
                            </div>
                        </div>
                        <MoreHorizontal size={20} className="text-white cursor-pointer"/>
                    </div>

                    {/* Contenu */}
                    <div className="px-4 pb-3 text-gray-200 text-sm">
                        <EditableText value={post.text} onChange={(val) => handlePostChange(i, 'text', val)} multiline readOnly={readOnly} />
                    </div>
                    {post.image && (
                        <div className="w-full h-80 relative bg-gray-900">
                             <EditableImage src={post.image} onChange={(url) => handlePostChange(i, 'image', url)} className="w-full h-full object-cover" readOnly={readOnly} />
                        </div>
                    )}

                    {/* Actions (Like/Comment) */}
                    <div className="p-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex gap-6">
                            <button className="flex items-center gap-2 text-white hover:text-red-500 transition group">
                                <Heart size={18} className="text-white group-hover:fill-red-500"/> <span className="text-xs font-bold">{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-white hover:text-blue-400 transition">
                                <MessageCircle size={18} className="text-white"/> <span className="text-xs font-bold">{post.comments}</span>
                            </button>
                        </div>
                        <button className="text-white hover:text-gray-300"><Share2 size={18}/></button>
                    </div>
                </div>
            )}
        />
        
        <div className="text-center mt-8">
            <button className={`text-xs uppercase tracking-widest ${theme.primaryColor} border-b border-transparent hover:border-current transition pb-1`}>
                Voir plus d'activités
            </button>
        </div>
      </div>
    </div>
  );
};


// --- 7. CONTACT BLOCK (AVEC FORMULAIRE EXTERNE) ---
export const ContactBlock: React.FC<BlockProps> = ({ content, theme, onUpdate, readOnly = false }) => {
  const { radius, font } = getThemeClasses(theme);

  const handleChange = (key: string, val: any) => {
    if (onUpdate) onUpdate({ ...content, [key]: val });
  };

  // Déterminer l'icône selon le type d'action choisi
  const getActionIcon = () => {
    switch(content.actionType) {
        case 'whatsapp': return <MessageCircle size={20} className="text-black" />;
        case 'email': return <Mail size={20} className="text-black" />;
        case 'call': return <Phone size={20} className="text-black" />;
        case 'calendar': return <Calendar size={20} className="text-black" />;
        case 'form': return <ExternalLink size={20} className="text-black" />;
        default: return <ExternalLink size={20} className="text-black" />;
    }
  };

  // Construire le lien dynamique
  const getActionLink = () => {
     switch(content.actionType) {
         case 'whatsapp': return `https://wa.me/${content.actionValue?.replace(/\D/g,'')}?text=Bonjour...`;
         case 'email': return `mailto:${content.actionValue}`;
         case 'call': return `tel:${content.actionValue}`;
         case 'form': return content.actionValue || '#';
         default: return content.actionValue || '#';
     }
  };

  return (
    <div className={`py-24 relative overflow-hidden bg-black/80 backdrop-blur-lg ${font} z-10`}>
      {/* Fond décoratif subtil */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1 bg-gradient-to-r from-transparent via-${theme.primaryColor.split('-')[1] || 'gold'}-500 to-transparent opacity-50`}></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        
        <EditableText
            tag="h2"
            className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
            value={content.title || "Contactez-nous"}
            onChange={(val) => handleChange('title', val)}
            readOnly={readOnly}
        />
        
        <EditableText
            tag="p"
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            value={content.subtitle}
            onChange={(val) => handleChange('subtitle', val)}
            readOnly={readOnly}
        />

        {/* Le Bouton d'Action Maître */}
        <a 
            href={!onUpdate ? getActionLink() : '#'}
            target={!onUpdate ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`
                inline-flex items-center gap-3 px-10 py-5 text-lg font-bold 
                ${theme.primaryColor.replace('text', 'bg')} text-black 
                ${radius} hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] 
                transition-all duration-300 group
            `}
            onClick={(e) => onUpdate && e.preventDefault()}
        >
            {getActionIcon()}
            <EditableText
                tag="span"
                value={content.ctaText || "Démarrer"}
                onChange={(val) => handleChange('ctaText', val)}
                readOnly={readOnly}
            />
        </a>

        {/* Infos Secondaires (Adresse, etc.) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-white border-t border-white/10 pt-10">
            {content.showEmail !== false && (
                <div className="flex flex-col items-center gap-2">
                    <Mail className={theme.primaryColor || "text-white"}/> 
                    <EditableText value={content.email} onChange={(val) => handleChange('email', val)} readOnly={readOnly} />
                </div>
            )}
            {content.showPhone !== false && (
                <div className="flex flex-col items-center gap-2">
                    <Phone className={theme.primaryColor || "text-white"}/> 
                    <EditableText value={content.phone} onChange={(val) => handleChange('phone', val)} readOnly={readOnly} />
                </div>
            )}
            {content.showAddress !== false && (
                <div className="flex flex-col items-center gap-2">
                    <MapPin className={theme.primaryColor || "text-white"}/> 
                    <EditableText value={content.address} onChange={(val) => handleChange('address', val)} readOnly={readOnly} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
