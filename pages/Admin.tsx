import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, query, doc, updateDoc, deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Users, DollarSign, Activity, Search, ShieldCheck, 
  CheckCircle, Gift, Ban, Eye, Download, LogOut,
  Trash2, XCircle, BadgeCheck, MessageCircle, Clock,
  Crown, Megaphone, ToggleLeft, ToggleRight, Link as LinkIcon, Calendar, Bell
} from 'lucide-react';

import { AppView } from '../types';

interface AdminProps {
  onNavigate: (view: AppView) => void;
}

export default function AdminDashboard({ onNavigate }: AdminProps) {
  const { user, loading } = useAuth();
  
  // --- ÉTATS ---
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, total: 0, active: 0, conversion: '0' });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // --- ÉTATS PLATEFORME ---
  const [platformSettings, setPlatformSettings] = useState({
    announcementText: "",
    isAnnouncementActive: false,
    featuredProviderId: "",
    currentPrice: 41 // Default price
  });
  const [priceInput, setPriceInput] = useState("41");

  const ADMIN_EMAIL = "benjibikamwa@gmail.com"; 

  // 1. VÉRIFICATION ADMIN
  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        onNavigate(AppView.LANDING); 
      }
    }
  }, [user, loading, onNavigate]);

  // 1.5 ÉCOUTE SETTINGS PLATEFORME
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      const unsub = onSnapshot(doc(db, "platform", "settings"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setPlatformSettings(data);
          setPriceInput(data.currentPrice?.toString() || "41");
        }
      });
      return () => unsub();
    }
  }, [user]);

  // 2. RÉCUPÉRATION DES DONNÉES
  const fetchUsers = async () => {
    if (user?.email === ADMIN_EMAIL) {
      setIsLoadingData(true);
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const pending = usersList.filter(u => u.paymentStatus === 'pending_verification').length;
        setPendingApprovals(pending);

        // Trier par date de création (récent en haut)
        usersList.sort((a: any, b: any) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        setRealUsers(usersList);

        const paidUsers = usersList.filter((u: any) => u.plan === 'premium' || u.plan === 'vip' || u.isPaid);
        const activeSites = usersList.filter((u: any) => u.status === 'active');
        
        setStats({
          total: usersList.length,
          revenue: paidUsers.length * (platformSettings.currentPrice || 41),
          active: activeSites.length,
          conversion: usersList.length > 0 ? ((paidUsers.length / usersList.length) * 100).toFixed(1) : '0'
        });

      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
  };

  useEffect(() => { 
      if (!loading && user?.email === ADMIN_EMAIL) {
          fetchUsers(); 
      }
  }, [user, loading]);

  const handleLogout = async () => {
    await signOut(auth);
    onNavigate(AppView.LANDING);
  };

  // --- COMMANDES SUPRÊMES (ASYNC FORCE) ---

  // 1. ACTIVER
  const handleActivate = async (userId: string) => {
    if (!userId) return;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: "active",
        isPaid: true,
        activatedAt: new Date().toISOString()
      });
      alert("Empire ACTIVÉ ! 🚀");
      fetchUsers();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // 2. DÉSACTIVER (FORCE)
  const handleDeactivate = async (userId: string) => {
     if (!userId) return;
     if(!confirm("RETIRER cet Empire de l'Arène ?")) return;
     try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { status: "inactive" });
        // UI update locale pour feedback immédiat
        setRealUsers(prev => prev.map(u => u.id === userId ? {...u, status: 'inactive'} : u));
        alert("Empire DÉSACTIVÉ. 🛡️");
     } catch (error) {
        console.error("Erreur:", error);
     }
  };

  // 3. BADGE / CERTIFICATION (FORCE)
  const handleBadge = async (userId: string, type: 'gold' | 'blue') => {
      if(!confirm(`Attribuer le Badge ${type === 'gold' ? 'VIP OR' : 'VÉRIFIÉ BLEU'} ?`)) return;
      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { 
            isVerified: true, 
            badgeType: type,
            plan: type === 'gold' ? 'vip' : 'premium' 
        });
        alert(`Badge ${type.toUpperCase()} attribué !`);
        fetchUsers();
      } catch (error) {
        console.error("Erreur:", error);
      }
  };

  const handleExtendAccess = async (userId: string, days: number) => {
    if (!userId) return;
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentExpiry = userData.expiryDate ? new Date(userData.expiryDate) : new Date();
        const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
        await updateDoc(userRef, {
          expiryDate: newExpiry.toISOString(),
        });
        alert(`Accès prolongé de ${days} jours !`);
        fetchUsers();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    if (!userId) return;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isVerified: !currentStatus,
      });
      alert(`Badge de vérification ${!currentStatus ? 'activé' : 'désactivé'} !`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };
  const handleSetFeatured = async (userId: string) => {
    if(!confirm("Élire cet utilisateur comme TOP PRESTATAIRE de l'Arène ?")) return;
    try {
      await setDoc(doc(db, "platform", "settings"), {
        ...platformSettings,
        featuredProviderId: userId
      }, { merge: true });
      alert("Nouveau TOP PRESTATAIRE élu ! 👑");
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // 3.6 UPDATE ANNONCE
  const handleUpdateSettings = async (updates: any) => {
    try {
      await setDoc(doc(db, "platform", "settings"), {
        ...platformSettings,
        ...updates
      }, { merge: true });
    } catch (error) {
      console.error("Erreur settings:", error);
    }
  };

  // 4. SUPPRESSION DÉFINITIVE (PURGE)
  const handleDeleteUser = async (userId: string) => {
      if(!confirm("⚠️ PURGE TOTALE : Cette action est irréversible. Supprimer ?")) return;
      try {
          await deleteDoc(doc(db, "users", userId));
          setRealUsers(prev => prev.filter(u => u.id !== userId)); // UI Update immédiate
          alert("Utilisateur PURGÉ de la base de données.");
      } catch (error) {
          console.error("Erreur suppression:", error);
      }
  };

  const handleSpy = (slug: string) => {
    if(slug) window.open(`/p/${slug}`, '_blank');
    else alert("Portfolio non généré.");
  };

  const formatWhatsAppNumber = (phone: string) => {
    if (!phone) return "";
    // Retirer tout ce qui n'est pas un chiffre
    let cleaned = phone.replace(/\D/g, '');
    // Si ça commence par 0, on remplace par 243
    if (cleaned.startsWith('0')) {
        cleaned = '243' + cleaned.substring(1);
    }
    // Si ça ne commence pas par 243 et fait 9 chiffres, on ajoute 243
    if (!cleaned.startsWith('243') && cleaned.length === 9) {
        cleaned = '243' + cleaned;
    }
    return cleaned;
  };

  const handleWhatsAppWelcome = (u: any) => {
    const phone = formatWhatsAppNumber(u.phone);
    if (!phone) {
        alert("Numéro non disponible ou mal formaté.");
        return;
    }
    const message = `Bonjour ${u.name} ! 👑 Bienvenue dans l'Arène My Folio-Tag. Je suis de la Hashtag Digital Team. Nous avons vu ton inscription, as-tu besoin d'aide pour finaliser la configuration de ton Empire ?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,Nom,Email,Telephone,Status\n";
    realUsers.forEach(u => {
      csvContent += `${u.name},${u.email},${u.phone || ''},${u.status || 'inactive'}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `empires_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // --- RENDU ---

  const filteredUsers = realUsers.filter(u => {
    const searchMatch = !searchTerm || 
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!searchMatch) return false;
    if (filterMode === 'unpaid') return u.status !== 'active';
    if (filterMode === 'premium') return u.status === 'active';
    return true;
  });

  if (loading || !user || user.email !== ADMIN_EMAIL) return <div className="min-h-screen bg-black flex items-center justify-center text-[#FFD700]">Accès Restreint.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FFD700] selection:text-black">
      
      {/* HEADER EMPIRE */}
      <header className="border-b border-white/10 bg-[#0a0a0a] px-6 py-4 sticky top-0 z-50 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <h1 className="text-xl font-black tracking-tighter text-white">
                    EMPIRE <span className="text-[#FFD700]">CONTROL</span>
                </h1>
                {pendingApprovals > 0 && (
                    <div className="relative">
                        <Bell size={20} className="text-yellow-400"/>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{pendingApprovals}</div>
                    </div>
                )}
            </div>
            <div className="flex gap-3">
                <button onClick={handleExport} className="relative z-50 pointer-events-auto flex items-center gap-2 text-xs font-bold bg-[#FFD700] text-black px-4 py-2 rounded hover:bg-[#FDB931] transition shadow-lg">
                    <Download size={14}/> CSV
                </button>
                <button onClick={handleLogout} className="relative z-50 pointer-events-auto flex items-center gap-2 text-xs font-bold bg-white/5 text-gray-400 border border-white/10 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
                    <LogOut size={14}/>
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111] border border-white/10 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Users size={18}/></div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Membres</span>
                </div>
                <h3 className="text-3xl font-black text-white">{stats.total}</h3>
            </div>
             <div className="bg-[#111] border border-gold-500/30 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-gold-500/10 rounded-lg text-[#FFD700]"><DollarSign size={18}/></div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Revenus</span>
                </div>
                <h3 className="text-3xl font-black text-[#FFD700]">{stats.revenue} $</h3>
            </div>
            <div className="bg-[#111] border border-white/10 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Activity size={18}/></div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Actifs</span>
                </div>
                <h3 className="text-3xl font-black text-white">{stats.active}</h3>
            </div>

            {/* CONTRÔLE PRIX (NOUVEAU) */}
            <div className="bg-[#111] border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <DollarSign size={16}/>
                    <span className="text-[10px] uppercase font-bold">Prix de l'Arène ($)</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-lg font-bold text-white focus:border-[#FFD700] outline-none"
                    />
                    <button 
                        onClick={() => handleUpdateSettings({ currentPrice: Number(priceInput) })}
                        className="bg-[#FFD700] text-black font-bold px-4 rounded-lg hover:bg-[#FDB931] transition"
                    >
                        OK
                    </button>
                </div>
            </div>

            {/* CONTRÔLE ARÈNE (NOUVEAU) */}
            <div className="bg-[#111] border border-[#FFD700]/20 p-5 rounded-2xl md:col-span-1">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-[#FFD700]">
                        <Megaphone size={16}/>
                        <span className="text-[10px] uppercase font-bold">Annonce Arène</span>
                    </div>
                    <button 
                        onClick={() => handleUpdateSettings({ isAnnouncementActive: !platformSettings.isAnnouncementActive })}
                        className="text-[#FFD700] hover:scale-110 transition"
                    >
                        {platformSettings.isAnnouncementActive ? <ToggleRight size={24}/> : <ToggleLeft size={24} className="text-gray-600"/>}
                    </button>
                </div>
                <textarea 
                    value={platformSettings.announcementText}
                    onChange={(e) => handleUpdateSettings({ announcementText: e.target.value })}
                    placeholder="Texte de l'annonce..."
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-gray-300 focus:border-[#FFD700] outline-none h-16 resize-none"
                />
            </div>
        </div>

        {/* CONTENU */}
        <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl overflow-hidden min-h-[500px]">
            <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0a0a0a]">
                <div className="flex gap-2">
                    <button onClick={() => setFilterMode('all')} className={`relative z-50 pointer-events-auto px-4 py-2 rounded-full text-xs font-bold border transition ${filterMode === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10'}`}>TOUS</button>
                    <button onClick={() => setFilterMode('unpaid')} className={`relative z-50 pointer-events-auto px-4 py-2 rounded-full text-xs font-bold border transition ${filterMode === 'unpaid' ? 'bg-red-500/10 text-red-500 border-red-500' : 'bg-transparent text-gray-500 border-white/10'}`}>INACTIFS</button>
                    <button onClick={() => setFilterMode('premium')} className={`relative z-50 pointer-events-auto px-4 py-2 rounded-full text-xs font-bold border transition ${filterMode === 'premium' ? 'bg-gold-500/10 text-gold-500 border-gold-500' : 'bg-transparent text-gray-500 border-white/10'}`}>ACTIFS</button>
                </div>
                <div className="bg-black border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-xs text-gray-400 w-full md:w-64">
                    <Search size={14}/> 
                    <input type="text" placeholder="Rechercher..." className="bg-transparent focus:outline-none w-full text-white placeholder-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-[#050505] text-xs uppercase font-bold text-gray-500 border-b border-white/10">
                        <tr>
                            <th className="p-4">Identité</th>
                            <th className="p-4">Domaine</th>
                            <th className="p-4">Téléphone</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4">CRM / Actions</th>
                            <th className="p-4">Badges & Purge</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5 transition relative z-0 group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border border-white/10 group-hover:border-[#FFD700] transition">
                                            {u.name ? u.name.charAt(0) : "?"}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {u.name || "Inconnu"}
                                                {u.isVerified && <BadgeCheck size={14} className={u.badgeType === 'gold' ? 'text-gold-500' : 'text-blue-500'} fill="currentColor" color="black"/>}
                                            </div>
                                            <div className="text-[10px] text-gray-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        {u.profession || u.category || "Non défini"}
                                    </span>
                                    {u.domainRequest && (
                                        <div className="mt-1 flex items-center gap-1 text-[9px] text-[#FFD700] font-bold animate-pulse">
                                            <LinkIcon size={10}/> {u.domainRequest.name}
                                        </div>
                                    )}
                                </td>

                                 <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-gray-400">{u.phone || "N/A"}</span>
                                        {u.phone && (
                                            <button 
                                                onClick={() => handleWhatsAppWelcome(u)}
                                                className="p-1.5 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition shadow-sm"
                                                title="Envoyer message d'accueil"
                                            >
                                                <MessageCircle size={12} fill="currentColor" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                
                                <td className="p-4">
                                    {u.status === 'active' || u.isPaid ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-500 text-[10px] font-bold border border-green-500/30">
                                            <CheckCircle size={10}/> {u.status === 'active' ? 'ACTIF' : 'PAYÉ'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 text-[10px] font-bold border border-yellow-500/30">
                                            <Clock size={10}/> EN ATTENTE
                                        </span>
                                    )}
                                </td>

                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {u.status === 'active' ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeactivate(u.id); }}
                                                className="relative z-50 pointer-events-auto bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all active:scale-95 flex items-center gap-1"
                                            >
                                                <XCircle size={12}/> DÉSACTIVER
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleActivate(u.id); }}
                                                className="relative z-50 pointer-events-auto bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all active:scale-95 flex items-center gap-1 shadow-lg shadow-green-900/20"
                                            >
                                                <DollarSign size={12}/> ACTIVER
                                            </button>
                                        )}
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex gap-2 relative z-50">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleSetFeatured(u.id); }} 
                                            className={`relative z-50 pointer-events-auto p-2 rounded-lg border transition ${platformSettings.featuredProviderId === u.id ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-[0_0_10px_#FFD700]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-[#FFD700] hover:border-[#FFD700]'}`} 
                                            title="Élire Top Prestataire"
                                        >
                                            <Crown size={16}/>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleToggleVerification(u.id, u.isVerified); }}
                                            className={`relative z-50 pointer-events-auto p-2 rounded-lg border transition ${u.isVerified ? 'bg-green-500/20 border-green-500/30 text-green-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-green-500 hover:border-green-500'}`}
                                            title="Activer/Désactiver le badge de vérification"
                                        >
                                            <ShieldCheck size={16}/>
                                        </button>
                                                                                <button 
                                            onClick={(e) => { e.stopPropagation(); handleExtendAccess(u.id, 30); }}
                                            className="relative z-50 pointer-events-auto p-2 rounded-lg bg-blue-900/20 border border-blue-500/50 text-blue-500 hover:bg-blue-500 hover:text-white transition" title="Prolonger 30 jours">
                                            <Clock size={16}/>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleExtendAccess(u.id, 365); }}
                                            className="relative z-50 pointer-events-auto p-2 rounded-lg bg-green-900/20 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white transition" title="Prolonger 1 an">
                                            <Calendar size={16}/>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSpy(u.portfolioSlug); }} className="relative z-50 pointer-events-auto p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition" title="Voir">
                                            <Eye size={16}/>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }} className="relative z-50 pointer-events-auto p-2 rounded-lg bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white transition" title="PURGER">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}