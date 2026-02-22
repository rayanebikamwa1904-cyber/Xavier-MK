import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Sparkles, Send, Star, MapPin, 
  ShoppingBag, Newspaper, CheckCircle, Loader2, LogOut,
  Plus, Trash2, Image as ImageIcon, Flag, ThumbsUp, MessageCircle, 
  User, Briefcase, Edit3, Camera, UploadCloud, X, Phone, Mail, MessageSquareQuote,
  Clock, Building2, CreditCard, Banknote, Smartphone, Copy, AlertTriangle, QrCode, FileText, Lock, Link as LinkIcon, Crown
} from 'lucide-react';
import { AppView, CreatorProfile } from '../types';

import { QRCodeCanvas } from 'qrcode.react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface WizardProps {
  onBack: () => void;
  onPublish: (profile: CreatorProfile) => void;
  onAuthRedirect: () => void;
  onNavigate: (view: AppView) => void;
  platformPrice: number | null;
}

export default function Wizard({ onNavigate, platformPrice }: WizardProps) {
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- ÉTATS GLOBAUX ---
  const [step, setStep] = useState<'prompt' | 'generating' | 'showroom' | 'studio'>('prompt'); 
  const [userData, setUserData] = useState<any>(null);
  
  // --- ÉTATS CREATION ---
  const [promptValue, setPromptValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // --- ÉTATS STUDIO INTERACTIF ---
  const [activeTab, setActiveTab] = useState<'identity' | 'portfolio' | 'social' | 'catalog' | 'reputation' | 'location' | 'prestige'>('identity');
  const [uploadTarget, setUploadTarget] = useState<'profile' | 'cover' | 'project' | 'post' | 'catalog' | null>(null);
  
  // --- ÉTATS PRESTIGE ---
  const [desiredDomain, setDesiredDomain] = useState("");
  const [domainRequestStatus, setDomainRequestStatus] = useState<'none' | 'pending' | 'sent'>( 'none');
  
  // --- ÉTATS PAIEMENT (MODULE CASH) ---
  const [showPayment, setShowPayment] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 59, s: 59 });
  const [copied, setCopied] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  // 1. Identité Visuelle & Contact
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [phone, setPhone] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [bio, setBio] = useState(""); 
  const [location, setLocation] = useState({ commune: '', address: '' });
  const [layoutType, setLayoutType] = useState<'GALLERY' | 'CATALOGUE' | 'SERVICES'>('GALLERY');

  // 2. Portfolio / Expertise
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [newProject, setNewProject] = useState({ title: '', desc: '', image: '' });

  // 2.5 Expérience
  const [experiences, setExperiences] = useState<any[]>([]);
  const [newExperience, setNewExperience] = useState({ role: '', company: '', year: '' });

  // 3. Mur Social
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState<{text: string, images: string[]}>({ text: '', images: [] });
  
  // 4. Catalogue
  const [catalog, setCatalog] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<{title: string, price: string, description: string, images: string[]}>({ title: '', price: '', description: '', images: [] });

  // 5. Témoignages
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', text: '', rating: 5 });

  // --- MODÈLES ---
  const models = [
    { id: 'majestic', name: 'Majestic', desc: 'Noir & Or - Luxe & Prestige', color: '#FFD700', bg: 'black' },
    { id: 'pure', name: 'Pure', desc: 'Blanc & Minimal - Confiance & Santé', color: '#3b82f6', bg: 'white' },
    { id: 'vibrant', name: 'Vibrant', desc: 'Dégradés & Énergie - Mode & Shop', color: '#fb7185', bg: '#0f172a' },
    { id: 'executive', name: 'Executive', desc: 'Bleu & Gris - Entreprise & État', color: '#94a3b8', bg: '#1e293b' }
  ];

  // --- INITIALISATION ---
  useEffect(() => {
    if (!loading && !user) {
        onNavigate(AppView.LOGIN);
        return;
    }
    
    if (user) {
        const fetchUserData = async () => {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                const data = snap.data();
                setUserData(data);
                
                // Charger les données existantes
                if (data.posts) setPosts(data.posts);
                if (data.catalog) setCatalog(data.catalog);
                if (data.skills) setSkills(data.skills);
                if (data.projects) setProjects(data.projects);
                if (data.experiences) setExperiences(data.experiences);
                if (data.testimonials) setTestimonials(data.testimonials);
                
                setPhone(data.phone || "");
                setEmail(data.email || "");
                setBio(data.bio || "");
                setLocation(data.location || { commune: '', address: '' });
                if (data.layoutType) setLayoutType(data.layoutType);
                if (data.domainRequest) {
                  setDesiredDomain(data.domainRequest.name || "");
                  setDomainRequestStatus(data.domainRequest.status === 'pending' ? 'sent' : 'none');
                }

                // Images par défaut ou chargées
                setProfileImage(data.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`);
                setCoverImage(data.coverImage || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80");
                
                // Restaurer l'état
                if (data.hasGenerated) {
                    setStep('studio');
                    setSelectedModel(data.selectedModel || 'majestic'); 
                }
            }
        };
        fetchUserData();
    }
  }, [user, loading, onNavigate]);

  // --- COMPTE À REBOURS OFFRE ---
  useEffect(() => {
    if (!showPayment) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showPayment]);

  // --- HELPER SAUVEGARDE ---
  const saveToDb = async (field: string, value: any) => {
      if(user) {
          await updateDoc(doc(db, "users", user.uid), { [field]: value });
      }
  };

  // --- HELPER COMPRESSION IMAGE (INVISIBLE CANVAS) ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compression JPEG qualité 0.6
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedDataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // --- HANDLER UPLOAD IMAGE (MULTI-SUPPORT) ---
  const triggerUpload = (target: 'profile' | 'cover' | 'project' | 'post' | 'catalog' | 'paymentProof') => {
      setUploadTarget(target);
      if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Traitement Séquentiel pour éviter surcharge mémoire
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
          try {
              const result = await compressImage(file);
              
              if (uploadTarget === 'profile') {
                  setProfileImage(result);
                  saveToDb('profileImage', result);
              } else if (uploadTarget === 'cover') {
                  setCoverImage(result);
                  saveToDb('coverImage', result);
              } else if (uploadTarget === 'project') {
                  setNewProject(prev => ({ ...prev, image: result }));
              } else if (uploadTarget === 'post') {
                  setNewPost(prev => ({ ...prev, images: [...prev.images, result] }));
              } else if (uploadTarget === 'catalog') {
                  setNewItem(prev => ({ ...prev, images: [...prev.images, result] }));
              }
          } catch (error) {
              console.error("Erreur compression:", error);
          }
      }
      e.target.value = '';
  };

  // --- HANDLERS WIZARD ---
  const handleGenerate = () => {
    if (!promptValue.trim()) return;
    setStep('generating');
    setTimeout(() => setStep('showroom'), 3000); 
  };

  const selectModel = async (modelId: string) => {
    if (!user) return;
    setStep('studio');
    setSelectedModel(modelId);
    
    await updateDoc(doc(db, "users", user.uid), {
        hasGenerated: true,
        selectedModel: modelId,
        userPrompt: promptValue,
        rating: 5,
        isVerified: false,
        portfolioSlug: userData?.name?.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000)
    });
  };

  // --- LOGIQUE DE PAIEMENT & PUBLICATION ---
  
  const handlePublishClick = () => {
      setShowPayment(true);
  };

  const getPrice = () => currency === 'USD' ? (platformPrice || 41) : 100000;
  const getAmountStr = () => currency === 'USD' ? `${(platformPrice || 41)}` : "100000";

  const getUssdLink = (provider: 'orange' | 'mpesa' | 'airtel') => {
      const amount = getAmountStr();
      const hash = encodeURIComponent('#');
      if (provider === 'orange') return `tel:*144*1*1*851606236*${amount}${hash}`;
      if (provider === 'mpesa') return `tel:*1122*1*1*835973729*${amount}${hash}`;
      if (provider === 'airtel') return `tel:*501*1*${amount}${hash}`;
      return '#';
  };

  const handleCopy = (number: string) => {
      navigator.clipboard.writeText(number.replace(/\s/g, ''));
      setCopied(number);
      setTimeout(() => setCopied(null), 2000);
  };

  const handleNotifyPayment = async () => {
      if (!user) return;
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const text = `Salut Hashtag Digital ! Je viens de régler mon portfolio MyFolio (Paiement Cash).\nPropriétaire : ${userData.name}\nMontant : ${getPrice()} ${currency}\nVoici la capture de la transaction. Activez mon empire ! 🚀`;
      
      // Update status to pending
      await updateDoc(doc(db, "users", user.uid), {
          paymentStatus: 'pending_verification',
          publishedAt: new Date(),
          statusMessage: "En attente de validation du paiement par l'Empire Hashtag Digital.",
          paymentProof: paymentProof,
          expiryDate: expiryDate.toISOString()
      });

      // Redirect to WhatsApp
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
      
      // Navigate to Arena (where status should be visible)
      onNavigate(AppView.ARENA);
  };

  // --- HANDLERS CRUD (Identiques) ---
  const handleAddSkill = () => {
      if(!newSkill.trim()) return;
      const updated = [...skills, newSkill.trim()];
      setSkills(updated); setNewSkill(""); saveToDb('skills', updated);
  };
  const handleDeleteSkill = (i: number) => {
      const updated = skills.filter((_, idx) => idx !== i);
      setSkills(updated); saveToDb('skills', updated);
  };
  const handleAddProject = () => {
      if(!newProject.title.trim()) return;
      const updated = [{ id: Date.now(), ...newProject }, ...projects];
      setProjects(updated); setNewProject({ title: '', desc: '', image: '' }); saveToDb('projects', updated);
  };
  const handleDeleteProject = (id: number) => {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated); saveToDb('projects', updated);
  };
  const handleAddExperience = () => {
      if(!newExperience.role.trim()) return;
      const updated = [{ id: Date.now(), ...newExperience }, ...experiences];
      setExperiences(updated); setNewExperience({ role: '', company: '', year: '' }); saveToDb('experiences', updated);
  };
  const handleDeleteExperience = (id: number) => {
      const updated = experiences.filter(x => x.id !== id);
      setExperiences(updated); saveToDb('experiences', updated);
  };
  const handleAddPost = async () => {
    if (!newPost.text.trim() && newPost.images.length === 0) return;
    if (!user) return;

    // 1. Sauvegarde dans la collection globale 'posts' (Source de vérité)
    await addDoc(collection(db, "posts"), {
        userId: user.uid,
        authorName: userData.name,
        content: newPost.text,
        images: newPost.images,
        createdAt: serverTimestamp(),
        likes: 0
    });

    // 2. Mise à jour locale (Optimistic UI)
    const updated = [{ id: Date.now(), text: newPost.text, date: "À l'instant", likes: 0, images: newPost.images }, ...posts];
    setPosts(updated); setNewPost({ text: '', images: [] }); saveToDb('posts', updated);
  };
  const handleDeletePost = (id: number) => {
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated); saveToDb('posts', updated);
  };
  const handleAddItem = () => {
    if (!newItem.title.trim() || !newItem.price.trim()) return;
    const updated = [...catalog, { id: Date.now(), ...newItem }];
    setCatalog(updated); setNewItem({ title: '', price: '', description: '', images: [] }); saveToDb('catalog', updated);
  };
  const handleDeleteItem = (id: number) => {
    const updated = catalog.filter(i => i.id !== id);
    setCatalog(updated); saveToDb('catalog', updated);
  };
  const handleAddTestimonial = () => {
      if(!newTestimonial.name.trim()) return;
      const updated = [...testimonials, { id: Date.now(), ...newTestimonial }];
      setTestimonials(updated); setNewTestimonial({ name: '', text: '', rating: 5 }); saveToDb('testimonials', updated);
  };
  const handleDeleteTestimonial = (id: number) => {
      const updated = testimonials.filter(t => t.id !== id);
      setTestimonials(updated); saveToDb('testimonials', updated);
  };
  const handleSaveBioContact = () => {
      saveToDb('phone', phone);
      saveToDb('email', email);
      saveToDb('bio', bio);
  };

  const handleDownloadQR = () => {
      if (!userData?.isPaid || !qrRef.current) return;
      const canvas = qrRef.current;
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "Mon_Empire_QR.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  };

  const handleDownloadPDF = () => {
      if (!userData?.isPaid) return;
      setIsPdfGenerating(true);
      
      const element = document.getElementById('portfolio-preview');
      if (!element) return;

      // Add PDF styling class
      element.classList.add('pdf-mode');

      const opt: any = {
        margin: 0,
        filename: `Mon_Empire_${userData.portfolioSlug}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
          // Remove PDF styling class
          element.classList.remove('pdf-mode');
          setIsPdfGenerating(false);
      });
  };

  const handleLogout = async () => {
    await signOut(auth);
    onNavigate(AppView.LANDING);
  };


  if (loading || !userData) return <div className="h-screen bg-black flex items-center justify-center text-[#FFD700]"><Loader2 className="animate-spin" size={40}/></div>;

  // --- VUES DU WIZARD ---

  if (step === 'prompt') return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                PRÉSENTE TON <span className="text-[#FFD700]">EMPIRE</span>
            </h1>
            <p className="text-gray-400 text-lg">
                Bienvenue <span className="text-white font-bold">{userData.name}</span>. <br/>
                Parle-moi de ton activité en une phrase. L'IA va concevoir ta vitrine Master Class.
            </p>
            <div className="relative group">
                <textarea 
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    placeholder="Ex: Je suis Dr Kabeya, j'ai une clinique à Gombe spécialisée en pédiatrie..."
                    className="w-full bg-[#111] border-2 border-white/5 rounded-3xl p-8 pt-10 text-xl text-white focus:border-[#FFD700] outline-none transition-all resize-none h-48 shadow-2xl placeholder-gray-600"
                />
                <button 
                    onClick={handleGenerate} 
                    className="absolute bottom-4 right-4 bg-[#FFD700] text-black p-4 rounded-2xl hover:scale-105 hover:bg-[#FDB931] transition shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50"
                    disabled={!promptValue.trim()}
                >
                    <Send size={24}/>
                </button>
            </div>
        </div>
    </div>
  );

  if (step === 'generating') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center space-y-8 font-sans">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-[#FFD700]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#FFD700] rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-[#FFD700] animate-pulse" size={40} />
        </div>
        <p className="text-[#FFD700] font-black tracking-[0.2em] animate-pulse text-lg">CONCEPTION DE VOTRE RÉSEAU PROFESSIONNEL...</p>
    </div>
  );

  if (step === 'showroom') return (
    <div className="min-h-screen bg-[#050505] p-10 font-sans flex flex-col justify-center">
        <h2 className="text-4xl font-black text-white text-center mb-16 tracking-tighter">
            CHOISIS TON <span className="text-[#FFD700]">STYLE</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
            {models.map((m, idx) => (
                <div 
                    key={m.id} 
                    onClick={() => selectModel(m.id)} 
                    className="group cursor-pointer bg-[#111] border border-white/10 rounded-[2rem] overflow-hidden hover:border-[#FFD700] hover:-translate-y-2 transition-all duration-500 shadow-2xl"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="h-64 flex items-center justify-center relative transition-colors duration-500" style={{backgroundColor: m.bg}}>
                        <div className="text-8xl font-black opacity-50 group-hover:opacity-100 transition-opacity duration-500 scale-110 group-hover:scale-125 transform" style={{color: m.color}}>
                            {m.name[0]}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300 backdrop-blur-sm">
                            <span className="bg-white text-black px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition">Choisir</span>
                        </div>
                    </div>
                    <div className="p-8 bg-[#0a0a0a]">
                        <h3 className="text-2xl font-bold text-white mb-2">{m.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{m.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  // --- STUDIO INTERACTIF ---
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans relative">
        <style>{`
            @media print {
                body * { visibility: hidden; }
                .portfolio-preview-container, .portfolio-preview-container * { visibility: visible; }
                .portfolio-preview-container { position: absolute; left: 0; top: 0; width: 100%; }
                .no-print { display: none !important; }
            }
            .pdf-mode {
                width: 100% !important;
                max-width: none !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                background-color: black !important;
            }
            .pdf-mode .pdf-footer {
                display: block !important;
            }
        `}</style>
        
        {/* === MODULE DE PAIEMENT (MODAL) === */}
        {showPayment && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto">
                
                <button onClick={() => setShowPayment(false)} className="fixed top-6 right-6 text-gray-500 hover:text-white z-50"><X size={32}/></button>

                <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl relative mt-10 md:mt-0">
                    
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Activation Empire</h2>
                        <p className="text-gray-400 text-xs">Paiement unique pour 1 an.</p>
                    </div>

                    {/* 1. SELECTION DEVISE */}
                    <div className="bg-black p-1 rounded-xl mb-6 border border-white/10">
                        <div className="grid grid-cols-2 gap-1">
                            <button 
                                onClick={() => setCurrency('USD')} 
                                className={`py-3 rounded-lg text-xs font-bold transition ${currency === 'USD' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                Payer en USD ($)
                            </button>
                            <button 
                                onClick={() => setCurrency('CDF')} 
                                className={`py-3 rounded-lg text-xs font-bold transition ${currency === 'CDF' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                Payer en CDF (FC)
                            </button>
                        </div>
                    </div>

                    {/* 2. PRIX DYNAMIQUE */}
                    <div className="text-center my-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Montant à régler</h3>
                        <div className="text-6xl font-black text-[#FFD700] font-serif my-2">
                            {currency === 'USD' ? `$${platformPrice || 41}` : '100.000 FC'}
                        </div>
                    </div>

                    {/* 3. CARTES OPÉRATEURS (RESPONSIVE) */}
                    <div className="space-y-3 mb-8">
                        {/* ORANGE MONEY */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="font-bold text-white text-sm">Orange Money</h3>
                                <p className="font-mono text-lg sm:text-xl font-bold text-[#ff7900] tracking-tight break-words">085 160 6236</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <a href={getUssdLink('orange')} className="flex-1 flex items-center justify-center gap-2 bg-[#ff7900] text-black font-bold py-2.5 rounded-lg text-xs hover:bg-white transition">
                                    <Smartphone size={14}/> USSD
                                </a>
                                <button onClick={() => handleCopy('0851606236')} className="flex-1 flex items-center justify-center gap-2 border border-white/20 text-gray-300 font-bold py-2.5 rounded-lg text-xs hover:bg-white/5 transition">
                                    {copied === '0851606236' ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>}
                                    {copied === '0851606236' ? 'Copié' : 'Copier'}
                                </button>
                            </div>
                        </div>
                        {/* M-PESA */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="font-bold text-white text-sm">M-Pesa</h3>
                                <p className="font-mono text-lg sm:text-xl font-bold text-[#e60000] tracking-tight break-words">083 597 3729</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <a href={getUssdLink('mpesa')} className="flex-1 flex items-center justify-center gap-2 bg-[#e60000] text-white font-bold py-2.5 rounded-lg text-xs hover:bg-white hover:text-black transition">
                                    <Smartphone size={14}/> USSD
                                </a>
                                <button onClick={() => handleCopy('0835973729')} className="flex-1 flex items-center justify-center gap-2 border border-white/20 text-gray-300 font-bold py-2.5 rounded-lg text-xs hover:bg-white/5 transition">
                                    {copied === '0835973729' ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>}
                                    {copied === '0835973729' ? 'Copié' : 'Copier'}
                                </button>
                            </div>
                        </div>
                        {/* AIRTEL MONEY */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="font-bold text-white text-sm">Airtel Money</h3>
                                <p className="font-mono text-lg sm:text-xl font-bold text-[#ff0000] tracking-tight break-words">097 905 7287</p>
                                <p className="text-[10px] text-gray-500">PICHARI CIBELE</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <a href={getUssdLink('airtel')} className="flex-1 flex items-center justify-center gap-2 bg-[#ff0000] text-white font-bold py-2.5 rounded-lg text-xs hover:bg-white hover:text-black transition">
                                    <Smartphone size={14}/> USSD
                                </a>
                                <button onClick={() => handleCopy('0979057287')} className="flex-1 flex items-center justify-center gap-2 border border-white/20 text-gray-300 font-bold py-2.5 rounded-lg text-xs hover:bg-white/5 transition">
                                    {copied === '0979057287' ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>}
                                    {copied === '0979057287' ? 'Copié' : 'Copier'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. UPLOAD PREUVE */}
                    <div className="my-6">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block text-center">Preuve de Paiement</label>
                        <div 
                            onClick={() => triggerUpload('paymentProof')}
                            className="w-full bg-black border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#FFD700] transition"
                        >
                            {paymentProof ? (
                                <div className="flex flex-col items-center gap-2">
                                    <img src={paymentProof} alt="Preuve de paiement" className="max-h-24 rounded-lg"/>
                                    <span className="text-green-500 text-xs font-bold">Image chargée !</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <UploadCloud size={32}/>
                                    <span className="text-sm">Cliquez pour charger une capture d'écran</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* NOTIFIER LE PAIEMENT */}
                    <button 
                        onClick={handleNotifyPayment}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] transition hover:scale-[1.02] disabled:opacity-50"
                        disabled={!paymentProof}
                    >
                        <MessageCircle size={20} fill="white" />
                        J'AI PAYÉ (Notifier sur WhatsApp)
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-500 mt-4 max-w-xs mx-auto">
                        Envoyez la capture de votre SMS de confirmation à notre équipe d'activation.
                    </p>

                </div>
            </div>
        )}

        {/* INPUT FICHIER CACHÉ */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            multiple={['post', 'catalog'].includes(uploadTarget || '')}
            onChange={handleFileChange}
        />

        {/* === SIDEBAR DE COMMANDE === */}
        <div className="w-96 bg-[#0a0a0a] border-r border-white/10 flex flex-col z-20 shadow-2xl">
            {/* OVERLAY SÉLECTION INITIALE */}
            {!userData.layoutType && (
                <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <Sparkles className="text-[#FFD700] mb-6" size={48}/>
                    <h2 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Configuration de l'Empire</h2>
                    <p className="text-gray-400 text-sm mb-8">Comment souhaitez-vous présenter votre activité ?</p>
                    <div className="space-y-4 w-full">
                        {[
                            { id: 'GALLERY', label: 'Vitrine Visuelle (Photos/Art)', desc: 'Idéal pour photographes, artistes, décorateurs.', icon: <ImageIcon size={20}/> },
                            { id: 'CATALOGUE', label: 'Catalogue & Prix (E-commerce/Menu)', desc: 'Idéal pour boutiques, restaurants, traiteurs.', icon: <ShoppingBag size={20}/> },
                            { id: 'SERVICES', label: 'Services & Réservation (Agence/Événement)', desc: 'Idéal pour agences, DJs, consultants.', icon: <Briefcase size={20}/> }
                        ].map(opt => (
                            <button 
                                key={opt.id}
                                onClick={() => {
                                    setLayoutType(opt.id as any);
                                    saveToDb('layoutType', opt.id);
                                    setUserData({ ...userData, layoutType: opt.id });
                                }}
                                className="w-full bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-[#FFD700] hover:bg-white/5 transition group text-left"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-[#FFD700] transition">
                                    {opt.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{opt.label}</p>
                                    <p className="text-[10px] text-gray-500">{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-black tracking-tighter text-[#FFD700]">MYFOLIO <span className="text-white text-xs bg-white/10 px-2 py-1 rounded">STUDIO</span></h2>
            </div>

            {/* SÉLECTEUR DE LAYOUT (LEGO) */}
            <div className="p-4 bg-white/5 border-b border-white/10">
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-widest">Type de Présentation</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'GALLERY', icon: <ImageIcon size={14}/>, label: 'Vitrine' },
                        { id: 'CATALOGUE', icon: <ShoppingBag size={14}/>, label: 'Catalogue' },
                        { id: 'SERVICES', icon: <Briefcase size={14}/>, label: 'Services' }
                    ].map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => {
                                setLayoutType(opt.id as any);
                                saveToDb('layoutType', opt.id);
                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${layoutType === opt.id ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-lg' : 'bg-black border-white/10 text-gray-500 hover:text-white'}`}
                        >
                            {opt.icon}
                            <span className="text-[9px] font-bold uppercase">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* NAV TABS */}
            <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar">
                <button onClick={() => setActiveTab('identity')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'identity' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Identité"><User size={18}/></button>
                <button onClick={() => setActiveTab('portfolio')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'portfolio' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Portfolio"><Briefcase size={18}/></button>
                <button onClick={() => setActiveTab('social')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'social' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Mur Social"><Newspaper size={18}/></button>
                <button onClick={() => setActiveTab('catalog')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'catalog' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Catalogue"><ShoppingBag size={18}/></button>
                <button onClick={() => setActiveTab('reputation')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'reputation' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Témoignages"><MessageSquareQuote size={18}/></button>
                <button onClick={() => setActiveTab('location')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'location' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Localisation"><MapPin size={18}/></button>
                <button onClick={() => setActiveTab('prestige')} className={`flex-1 min-w-[50px] py-4 flex justify-center items-center hover:bg-white/5 transition ${activeTab === 'prestige' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`} title="Pack Prestige"><Crown size={18}/></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0a0a0a]">
                
                {/* 1. TAB IDENTITÉ */}
                {activeTab === 'identity' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-4">Identité Visuelle & Contact</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Photo de Profil</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white/20 overflow-hidden shrink-0 relative group">
                                    <img src={profileImage} className="w-full h-full object-cover" alt="Profile"/>
                                </div>
                                <button onClick={() => triggerUpload('profile')} className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition border border-white/10 flex items-center gap-2">
                                    <UploadCloud size={14}/> Changer
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Image de Couverture</label>
                            <div className="w-full h-24 rounded-xl bg-gray-800 border-2 border-white/20 overflow-hidden relative group cursor-pointer" onClick={() => triggerUpload('cover')}>
                                <img src={coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" alt="Cover"/>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold flex items-center gap-2 text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-black/70 transition"><UploadCloud size={14}/> Changer la couverture</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} onBlur={handleSaveBioContact} className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm text-white h-24" placeholder="Votre biographie..."/>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Contacts Directs</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-500"/>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={handleSaveBioContact} className="flex-1 bg-black border border-white/20 rounded-lg p-2 text-sm text-white" placeholder="Téléphone (Appel direct)"/>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-500"/>
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={handleSaveBioContact} className="flex-1 bg-black border border-white/20 rounded-lg p-2 text-sm text-white" placeholder="Adresse Email"/>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TAB PORTFOLIO (Skills, Projects, XP) */}
                {activeTab === 'portfolio' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Compétences */}
                        <div className="space-y-3">
                             <label className="text-xs font-black text-[#FFD700] uppercase tracking-widest block">Mes Compétences</label>
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newSkill} 
                                    onChange={(e) => setNewSkill(e.target.value)} 
                                    className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD700] text-white"
                                    placeholder="Ex: Chirurgie, Design..."
                                />
                                <button onClick={handleAddSkill} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white border border-white/10"><Plus size={18}/></button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                 {skills.map((skill, idx) => (
                                     <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-full flex items-center gap-2 text-gray-300">
                                         {skill} <button onClick={() => handleDeleteSkill(idx)} className="hover:text-red-500"><X size={10}/></button>
                                     </span>
                                 ))}
                             </div>
                        </div>

                        {/* Expérience (NEW) */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                             <label className="text-xs font-black text-[#FFD700] uppercase tracking-widest block">Mon Parcours</label>
                             <div className="grid grid-cols-2 gap-2">
                                 <input value={newExperience.role} onChange={(e) => setNewExperience({...newExperience, role: e.target.value})} className="bg-black border border-white/20 rounded-lg px-2 py-2 text-sm text-white" placeholder="Rôle (ex: CEO)"/>
                                 <input value={newExperience.year} onChange={(e) => setNewExperience({...newExperience, year: e.target.value})} className="bg-black border border-white/20 rounded-lg px-2 py-2 text-sm text-white" placeholder="Année"/>
                             </div>
                             <input value={newExperience.company} onChange={(e) => setNewExperience({...newExperience, company: e.target.value})} className="w-full bg-black border border-white/20 rounded-lg px-2 py-2 text-sm text-white" placeholder="Entreprise / Lieu"/>
                             <button onClick={handleAddExperience} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 border border-white/10">
                                 <Plus size={14}/> Ajouter Expérience
                             </button>
                             <div className="space-y-2 mt-2">
                                {experiences.map(x => (
                                    <div key={x.id} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                                        <div><span className="font-bold text-white">{x.role}</span> <span className="text-gray-500">chez {x.company}</span></div>
                                        <button onClick={() => handleDeleteExperience(x.id)} className="text-red-500"><Trash2 size={12}/></button>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Projets */}
                        <div className="space-y-3 pt-6 border-t border-white/10">
                             <label className="text-xs font-black text-[#FFD700] uppercase tracking-widest block">Nouvelle Réalisation</label>
                             
                             <div 
                                className="w-full h-20 bg-black border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#FFD700] hover:bg-white/5 transition mb-2"
                                onClick={() => triggerUpload('project')}
                             >
                                 {newProject.image ? (
                                     <img src={newProject.image} className="h-full w-full object-cover rounded-lg opacity-80" alt="Preview"/>
                                 ) : (
                                     <span className="text-[10px] text-gray-500 flex items-center gap-2"><UploadCloud size={14}/> Image du Projet</span>
                                 )}
                             </div>

                             <input 
                                type="text" 
                                value={newProject.title} 
                                onChange={(e) => setNewProject({...newProject, title: e.target.value})} 
                                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD700] text-white"
                                placeholder="Titre du projet"
                             />
                             <textarea 
                                value={newProject.desc} 
                                onChange={(e) => setNewProject({...newProject, desc: e.target.value})} 
                                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD700] h-20 resize-none text-white"
                                placeholder="Description courte..."
                             />
                             
                             <button onClick={handleAddProject} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 border border-white/10">
                                 <Plus size={14}/> Ajouter ce Projet
                             </button>

                             <div className="space-y-2 mt-4">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Projets ({projects.length})</p>
                                {projects.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                                        <div className="w-10 h-10 bg-gray-800 rounded overflow-hidden shrink-0">
                                            {p.image ? <img src={p.image} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Briefcase size={16}/></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate text-white">{p.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{p.desc}</p>
                                        </div>
                                        <button onClick={() => handleDeleteProject(p.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}

                {/* 3. TAB SOCIAL */}
                {activeTab === 'social' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest">Mur Social</h3>
                        <textarea 
                            value={newPost.text}
                            onChange={(e) => setNewPost({...newPost, text: e.target.value})}
                            placeholder="Quoi de neuf dans votre empire ?"
                            className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[#FFD700] outline-none h-24 resize-none transition-colors"
                        />
                        
                        {/* Zone Upload Multi */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                             <div onClick={() => triggerUpload('post')} className="w-16 h-16 shrink-0 bg-white/5 border border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:border-[#FFD700]">
                                <Plus size={20} className="text-gray-400"/>
                             </div>
                             {newPost.images.map((img, idx) => (
                                 <div key={idx} className="w-16 h-16 shrink-0 relative rounded overflow-hidden border border-white/10">
                                     <img src={img} className="w-full h-full object-cover"/>
                                     <button onClick={() => setNewPost(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))} className="absolute top-0 right-0 bg-red-500 p-0.5"><X size={10} className="text-white"/></button>
                                 </div>
                             ))}
                        </div>

                        <button 
                          onClick={handleAddPost} 
                          className="w-full bg-white text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FFD700] transition shadow-lg"
                        >
                            <Send size={18}/> PUBLIER SUR LE MUR
                        </button>
                        <div className="mt-4 border-t border-white/10 pt-4">
                            <p className="text-xs text-gray-500 mb-2 font-bold">Historique ({posts.length})</p>
                            {posts.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-xs text-gray-400 py-1 border-b border-white/5 last:border-0">
                                    <span className="truncate w-3/4">{p.text || "(Images seulement)"}</span>
                                    <button onClick={() => handleDeletePost(p.id)} className="hover:text-red-500"><Trash2 size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. TAB CATALOG */}
                {activeTab === 'catalog' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest">Catalogue</h3>
                        <input 
                            type="text" placeholder="Nom du produit/service"
                            value={newItem.title}
                            onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFD700] transition-colors"
                        />
                        <input 
                            type="text" placeholder="Prix ou Détail (ex: 50$)"
                            value={newItem.price}
                            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFD700] transition-colors"
                        />
                        <textarea 
                            value={newItem.description}
                            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                            placeholder="Description détaillée..."
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFD700] transition-colors h-20 resize-none"
                        />

                        {/* Zone Upload Multi Catalog */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                             <div onClick={() => triggerUpload('catalog')} className="w-16 h-16 shrink-0 bg-white/5 border border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:border-[#FFD700]">
                                <Plus size={20} className="text-gray-400"/>
                             </div>
                             {newItem.images.map((img, idx) => (
                                 <div key={idx} className="w-16 h-16 shrink-0 relative rounded overflow-hidden border border-white/10">
                                     <img src={img} className="w-full h-full object-cover"/>
                                     <button onClick={() => setNewItem(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))} className="absolute top-0 right-0 bg-red-500 p-0.5"><X size={10} className="text-white"/></button>
                                 </div>
                             ))}
                        </div>

                        <button 
                          onClick={handleAddItem} 
                          className="w-full bg-[#FFD700] text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FDB931] transition shadow-lg"
                        >
                            <ShoppingBag size={18}/> AJOUTER L'ARTICLE
                        </button>
                         <div className="mt-4 border-t border-white/10 pt-4">
                            <p className="text-xs text-gray-500 mb-2 font-bold">Inventaire ({catalog.length})</p>
                            {catalog.map(i => (
                                <div key={i.id} className="flex justify-between items-center text-xs text-gray-400 py-1 border-b border-white/5 last:border-0">
                                    <span className="truncate w-1/2">{i.title}</span>
                                    <span className="text-[#FFD700]">{i.price}</span>
                                    <button onClick={() => handleDeleteItem(i.id)} className="hover:text-red-500"><Trash2 size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. TAB REPUTATION (Témoignages) */}
                {activeTab === 'reputation' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest">Témoignages Clients</h3>
                        <input 
                            type="text" placeholder="Nom du Client"
                            value={newTestimonial.name}
                            onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFD700]"
                        />
                        <textarea 
                            value={newTestimonial.text}
                            onChange={(e) => setNewTestimonial({...newTestimonial, text: e.target.value})}
                            placeholder="Son avis..."
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFD700] h-24 resize-none"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Note:</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(star => (
                                    <Star 
                                        key={star} 
                                        size={16} 
                                        className={`cursor-pointer ${star <= newTestimonial.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-600'}`}
                                        onClick={() => setNewTestimonial({...newTestimonial, rating: star})}
                                    />
                                ))}
                            </div>
                        </div>
                        <button 
                          onClick={handleAddTestimonial} 
                          className="w-full bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition"
                        >
                            <MessageSquareQuote size={18}/> AJOUTER AVIS
                        </button>
                        <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                             {testimonials.map(t => (
                                 <div key={t.id} className="bg-white/5 p-2 rounded flex justify-between items-center text-xs">
                                     <div><span className="font-bold text-white">{t.name}</span> <span className="text-[#FFD700]">★ {t.rating}</span></div>
                                     <button onClick={() => handleDeleteTestimonial(t.id)} className="text-red-500"><Trash2 size={12}/></button>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* 6. TAB LOCATION */}
                {activeTab === 'location' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-4">Localisation</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ville et Commune</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700] z-10"/>
                                    <input 
                                        type="text"
                                        value={location.commune}
                                        onChange={(e) => {
                                            const newLoc = { ...location, commune: e.target.value };
                                            setLocation(newLoc);
                                            saveToDb('location', newLoc);
                                        }}
                                        placeholder="Ex: Lubumbashi, Kampemba"
                                        className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#FFD700] transition placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Adresse Précise / Référence</label>
                                <div className="relative group">
                                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FFD700] transition"/>
                                    <input 
                                        type="text" 
                                        value={location.address}
                                        onChange={(e) => setLocation({ ...location, address: e.target.value })}
                                        onBlur={() => saveToDb('location', location)}
                                        placeholder="Votre adresse ou référence (Optionnel)"
                                        className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#FFD700] transition placeholder-gray-600"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                    <Sparkles size={10} className="text-[#FFD700]"/> 
                                    Cette adresse aidera vos clients à vous trouver plus facilement.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. TAB PRESTIGE (NOUVEAU) */}
                {activeTab === 'prestige' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#FFD700]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                <Crown size={80} className="text-[#FFD700]"/>
                            </div>
                            
                            <h3 className="text-xl font-black text-white mb-4 tracking-tighter flex items-center gap-2">
                                <Crown size={20} className="text-[#FFD700]"/> Pack Prestige
                            </h3>
                            
                            <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                                Passez au niveau supérieur en connectant votre propre adresse web. Ce pack inclut :
                            </p>
                            
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3 text-[11px] text-gray-300">
                                    <div className="mt-1 text-[#FFD700]"><CheckCircle size={12}/></div>
                                    <span>🌐 <strong>Un nom de domaine professionnel</strong> (ex: www.votre-marque.com)</span>
                                </li>
                                <li className="flex items-start gap-3 text-[11px] text-gray-300">
                                    <div className="mt-1 text-[#FFD700]"><CheckCircle size={12}/></div>
                                    <span>🔒 <strong>Certificat de sécurité SSL inclus</strong> (Navigation sécurisée avec cadenas)</span>
                                </li>
                                <li className="flex items-start gap-3 text-[11px] text-gray-300">
                                    <div className="mt-1 text-[#FFD700]"><CheckCircle size={12}/></div>
                                    <span>🛠️ <strong>Zéro technique</strong> : Notre équipe gère 100% de l'installation et de la maintenance.</span>
                                </li>
                            </ul>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Nom de domaine souhaité</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={desiredDomain}
                                        onChange={(e) => setDesiredDomain(e.target.value)}
                                        placeholder="ex: monrestaurant.com"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:border-[#FFD700] outline-none"
                                        disabled={domainRequestStatus === 'sent'}
                                    />
                                    <LinkIcon className="absolute left-3 top-3.5 text-gray-600" size={16}/>
                                </div>

                                <button 
                                    onClick={() => {
                                        if (!desiredDomain.trim()) return;
                                        saveToDb('domainRequest', { name: desiredDomain, status: 'pending', requestedAt: new Date().toISOString() });
                                        setDomainRequestStatus('sent');
                                    }}
                                    disabled={domainRequestStatus === 'sent' || !desiredDomain.trim()}
                                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2 ${domainRequestStatus === 'sent' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-[#FFD700] text-black hover:bg-white'}`}
                                >
                                    {domainRequestStatus === 'sent' ? (
                                        <>Demande envoyée - Nous vous contactons sur WhatsApp</>
                                    ) : (
                                        <>Demander l'activation</>
                                    )}
                                </button>
                                
                                <p className="text-[9px] text-gray-600 italic text-center">
                                    * Service disponible à partir de 50$/an (pour les extensions .com, .net, .org). Tarification sur mesure pour les domaines .cd ou institutionnels.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECTION KIT DE CONQUÊTE (VERROUILLÉ) --- */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Sparkles size={14}/> VOTRE KIT DE CONQUÊTE
                    </h3>

                    <div className="space-y-6">
                        {/* SLOT 0 : LIEN PARTAGEABLE */}
                        <div className="relative">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                <LinkIcon size={12}/> Lien Officiel
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        readOnly
                                        value={userData?.isPaid ? `https://myfoliotag.com/${userData?.portfolioSlug}` : `https://myfoliotag.com/${userData?.portfolioSlug?.slice(0,3)}*******`}
                                        className={`w-full bg-[#111] border border-white/10 rounded-lg py-3 px-4 text-xs outline-none font-mono ${!userData?.isPaid ? 'text-gray-600' : 'text-[#FFD700]'}`}
                                    />
                                    {!userData?.isPaid && <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"/>}
                                </div>
                                <button 
                                    onClick={() => {
                                        if(userData?.isPaid) {
                                            navigator.clipboard.writeText(`https://myfoliotag.com/${userData?.portfolioSlug}`);
                                            setLinkCopied(true);
                                            setTimeout(() => setLinkCopied(false), 2000);
                                        }
                                    }}
                                    disabled={!userData?.isPaid}
                                    className={`px-4 rounded-lg flex items-center justify-center transition ${userData?.isPaid ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' : 'bg-[#111] border border-white/5 text-gray-700 cursor-not-allowed'}`}
                                >
                                    {linkCopied ? <CheckCircle size={16} className="text-green-500"/> : <Copy size={16}/>}
                                </button>
                            </div>
                            {linkCopied && <p className="text-[10px] text-[#FFD700] mt-1 text-right animate-fade-in">Lien copié dans l'Empire !</p>}
                        </div>

                        {/* SLOT 1 : QR CODE */}
                        <div className="relative group">
                            <div className={`bg-[#111] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center transition-all ${!userData?.isPaid ? 'blur-sm opacity-50 select-none pointer-events-none' : ''}`}>
                                <div className="bg-white p-2 rounded-lg mb-4">
                                    <QRCodeCanvas 
                                        value={`https://myfoliotag.com/${userData?.portfolioSlug}`} 
                                        size={128}
                                        level={"H"}
                                        ref={qrRef}
                                    />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">QR Code Empire</h4>
                                <p className="text-[10px] text-gray-500">Scannez pour accéder à votre portfolio.</p>
                                <button 
                                    onClick={handleDownloadQR}
                                    disabled={!userData?.isPaid}
                                    className="mt-4 text-[10px] font-bold text-[#FFD700] border border-[#FFD700] px-3 py-1 rounded hover:bg-[#FFD700] hover:text-black transition"
                                >
                                    TÉLÉCHARGER PNG
                                </button>
                            </div>
                            
                            {/* OVERLAY LOCK */}
                            {!userData?.isPaid && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <div className="bg-black/80 backdrop-blur-md border border-[#FFD700]/30 p-4 rounded-2xl flex flex-col items-center shadow-2xl">
                                        <Lock size={24} className="text-[#FFD700] mb-2"/>
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Kit Verrouillé</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SLOT 2 : PDF EXPORT */}
                        <div className="relative">
                             <button 
                                onClick={handleDownloadPDF}
                                disabled={!userData?.isPaid || isPdfGenerating}
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all ${userData?.isPaid ? 'bg-white text-black hover:bg-[#FFD700] shadow-lg' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'}`}
                             >
                                {isPdfGenerating ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18}/>}
                                {userData?.isPaid ? (isPdfGenerating ? "GÉNÉRATION EN COURS..." : "TÉLÉCHARGER MON DOSSIER PDF") : "EXPORT PDF (PREMIUM)"}
                             </button>
                             
                             {!userData?.isPaid && (
                                <p className="text-center text-[10px] text-red-500 mt-3 flex items-center justify-center gap-1 animate-pulse">
                                    <Lock size={10}/> Contactez l'administrateur pour activer.
                                </p>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER SIDEBAR */}
            <div className="p-6 border-t border-white/10 bg-black/50 space-y-3">
                 <button 
                   onClick={handlePublishClick}
                   className="w-full bg-[#FFD700] text-black font-black py-3 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:bg-[#FDB931] hover:scale-105 transition text-sm flex items-center justify-center gap-2"
                 >
                    PUBLIER L'EMPIRE
                 </button>
                 <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-600 py-2 hover:text-red-500 transition font-bold uppercase tracking-widest">
                    <LogOut size={12}/> Se déconnecter
                </button>
            </div>
        </div>

        {/* === PREVIEW (LE TÉLÉPHONE) === */}
        <div className="flex-grow bg-[#111] overflow-y-auto p-10 flex justify-center items-start custom-scrollbar">
            <div id="portfolio-preview" className="portfolio-preview-container w-full max-w-sm bg-black rounded-[3rem] border-[8px] border-[#222] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden pb-10 min-h-[800px]">
                
                {/* --- 1. HEADER (IDENTITÉ) --- */}
                <div className="relative">
                    {/* Photo de Couverture */}
                    <div className="h-40 w-full bg-gray-800 relative group cursor-pointer" onClick={() => triggerUpload('cover')}>
                        <img src={coverImage} className="w-full h-full object-cover opacity-80" alt="Cover"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-md">
                            <Edit3 size={14} className="text-white"/>
                        </div>
                    </div>

                    {/* Info Profil (Overlay) */}
                    <div className="px-6 -mt-16 relative z-10 flex flex-col items-center">
                        {/* Avatar */}
                        <div className="w-28 h-28 rounded-full bg-black border-4 border-black relative group cursor-pointer shadow-2xl overflow-hidden" onClick={() => triggerUpload('profile')}>
                             <img src={profileImage} className="w-full h-full object-cover" alt="Avatar"/>
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <Camera size={24} className="text-white"/>
                             </div>
                        </div>

                        <div className="text-center mt-4 w-full">
                            <h3 className="font-bold flex items-center justify-center gap-2 text-white text-xl">
                                {userData.name} <CheckCircle size={18} className="text-blue-500 fill-black"/>
                            </h3>
                            <p className="text-sm text-gray-400 mb-3 uppercase tracking-wide font-bold">{userData.profession || "Entrepreneur"}</p>
                            
                            {/* Bio si présente */}
                            {bio && <p className="text-xs text-gray-300 mb-4 whitespace-pre-line px-2">{bio}</p>}

                            {/* BADGES COMPÉTENCES */}
                            <div className="flex flex-wrap justify-center gap-2 mb-4 px-4">
                                {skills.map((skill, i) => (
                                    <span key={i} className="text-[10px] bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                                        {skill}
                                    </span>
                                ))}
                                {skills.length === 0 && <span className="text-[10px] text-gray-600 italic">Ajoutez vos compétences...</span>}
                            </div>
                            
                            {/* BOUTONS CONTACT (TRIPLE) */}
                            <div className="flex justify-center gap-3 mb-6">
                                <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} className="bg-[#25D366] text-white p-2.5 rounded-full hover:scale-110 transition shadow-lg"><MessageCircle size={18}/></a>
                                {phone && <a href={`tel:${phone}`} className="bg-white text-black p-2.5 rounded-full hover:scale-110 transition shadow-lg"><Phone size={18}/></a>}
                                {email && <a href={`mailto:${email}`} className="bg-blue-500 text-white p-2.5 rounded-full hover:scale-110 transition shadow-lg"><Mail size={18}/></a>}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Contenu du téléphone */}
                <div className="px-5 pb-5 space-y-8">
                    
                    {/* --- EXPÉRIENCE (NOUVEAU) --- */}
                    {experiences.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Clock size={12}/> Mon Parcours
                            </h4>
                            <div className="space-y-3">
                                {experiences.map(x => (
                                    <div key={x.id} className="flex gap-3 items-start">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-[#FFD700] shrink-0"></div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{x.role}</p>
                                            <p className="text-[10px] text-gray-400">{x.company} • {x.year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 2. MUR SOCIAL (MULTI IMAGE) --- */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b border-white/5 pb-2">
                            <Newspaper size={12}/> Fil d'actualité
                        </h4>
                        
                        <div className="space-y-4">
                            {posts.length === 0 && <p className="text-[10px] text-gray-600 italic text-center py-4">Aucune actualité.</p>}
                            {posts.map(post => (
                                <div key={post.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2 group relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                            <img src={profileImage} className="w-full h-full object-cover" alt=""/>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white">{userData.name}</p>
                                            <p className="text-[9px] text-gray-500 uppercase">{post.date}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed pl-8">{post.text}</p>
                                    
                                    {/* GRID IMAGES POST */}
                                    {post.images && post.images.length > 0 && (
                                        <div className={`mt-2 grid gap-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {post.images.map((img: string, i: number) => (
                                                <div key={i} className="rounded-lg overflow-hidden h-32 bg-gray-800">
                                                    <img src={img} className="w-full h-full object-cover"/>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pl-8 pt-2 flex gap-3 text-gray-500">
                                        <div className="flex items-center gap-1 text-[10px]"><ThumbsUp size={10}/> {post.likes}</div>
                                        <div className="flex items-center gap-1 text-[10px]"><MessageCircle size={10}/> Commenter</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- 3. PROJETS / RÉALISATIONS --- */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b border-white/5 pb-2">
                            <Briefcase size={12}/> Mes Réalisations
                        </h4>
                        
                        {projects.length === 0 && <p className="text-[10px] text-gray-600 italic text-center py-4 border border-dashed border-white/10 rounded-xl">Portfolio vide. Ajoutez vos projets.</p>}
                        
                        <div className="grid grid-cols-2 gap-3">
                            {projects.map(p => (
                                <div key={p.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 relative group hover:border-[#FFD700]/30 transition">
                                    <div className="h-24 bg-gray-800 relative">
                                        {p.image ? (
                                            <img src={p.image} className="w-full h-full object-cover" alt=""/> 
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600"><Briefcase size={20}/></div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h5 className="text-[11px] font-bold text-white leading-tight mb-1 truncate">{p.title}</h5>
                                        <p className="text-[9px] text-gray-400 line-clamp-2">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- 4. CATALOGUE (MULTI IMAGE + DESC) --- */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b border-white/5 pb-2">
                            <ShoppingBag size={12}/> Catalogue
                        </h4>
                        <div className="space-y-3">
                            {catalog.map(item => (
                                <div key={item.id} className="bg-[#111] rounded-2xl overflow-hidden border border-white/5 relative group hover:border-white/20 transition p-3 flex gap-3">
                                    <div className="w-20 h-20 bg-gray-900 rounded-lg shrink-0 overflow-hidden relative">
                                        {item.images && item.images.length > 0 ? (
                                            <>
                                                <img src={item.images[0]} className="w-full h-full object-cover"/>
                                                {item.images.length > 1 && <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded">+{item.images.length - 1}</div>}
                                            </>
                                        ) : <Camera size={20} className="text-gray-800 m-auto mt-6"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[11px] font-bold truncate text-white">{item.title}</p>
                                            <p className="text-[10px] text-[#FFD700] font-black">{item.price}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                            {catalog.length === 0 && <div className="text-center text-[10px] text-gray-600 italic py-4">Catalogue vide.</div>}
                        </div>
                    </div>

                    {/* --- 4.5 TÉMOIGNAGES (NOUVEAU) --- */}
                    {testimonials.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b border-white/5 pb-2">
                                <MessageSquareQuote size={12}/> Ils ont adoré
                            </h4>
                            <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                                {testimonials.map(t => (
                                    <div key={t.id} className="min-w-[200px] bg-white/5 p-4 rounded-xl border border-white/5 snap-center">
                                        <div className="flex gap-1 text-[#FFD700] mb-2">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < t.rating ? "#FFD700" : "transparent"}/>)}
                                        </div>
                                        <p className="text-[10px] text-gray-300 italic mb-2 line-clamp-3">"{t.text}"</p>
                                        <p className="text-[9px] font-bold text-white text-right">- {t.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 5. LOCALISATION --- */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b border-white/5 pb-2">
                            <MapPin size={12}/> Localisation
                        </h4>
                        <div className="h-24 bg-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                             <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover opacity-50"/>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-xs font-bold text-white flex items-center gap-1"><MapPin size={12}/> Kinshasa, Gombe</span>
                             </div>
                        </div>
                    </div>

                    {/* Footer Réseau */}
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                         <div className="flex items-center gap-2 text-red-900/50 text-[10px] font-bold cursor-not-allowed">
                            <Flag size={12}/> SIGNALER
                         </div>
                         <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                            MyFolio Network
                         </div>
                    </div>

                     {/* Footer PDF (Visible seulement à l'export) */}
                     <div className="pdf-footer hidden pt-10 pb-4 text-center border-t border-white/10 mt-10">
                        <p className="text-[10px] text-gray-400 font-serif italic">Généré par My Folio-Tag — Créez votre Empire numérique.</p>
                     </div>
                </div>

            </div>
        </div>
    </div>
  );
}
