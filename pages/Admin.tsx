import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext'; // Vérifie le chemin vers ton contexte
import { db, auth } from './lib/firebase';
import { collection, getDocs, query, doc, updateDoc, deleteDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Users, DollarSign, Activity, Search, ShieldCheck, 
  CheckCircle, Gift, Ban, Eye, Download, LogOut,
  Trash2, XCircle, BadgeCheck, MessageCircle, Clock,
  Crown, Megaphone, ToggleLeft, ToggleRight, Bell
} from 'lucide-react';

import { AppView, CreatorProfile } from './types';

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
    currentPrice: 41 
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

        usersList.sort((a: any, b: any) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        setRealUsers(usersList);

        const paidUsers = usersList.filter((u: any) => u.isPaid || u.plan === 'premium');
        const activeSites = usersList.filter((u: any) => u.status === 'active');
        
        setStats({
          total: usersList.length,
          revenue: paidUsers.length * (platformSettings.currentPrice || 41),
          active: activeSites.length,
          conversion: usersList.length > 0 ? ((paidUsers.length / usersList.length) * 100).toFixed(1) : '0'
        });

      } catch (error) {
        console.error("Erreur fetchUsers:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
  };

  useEffect(() => { 
      if (!loading && user?.email === ADMIN_EMAIL) {
          fetchUsers(); 
      }
  }, [user, loading, platformSettings.currentPrice]);

  const handleLogout = async () => {
    await signOut(auth);
    onNavigate(AppView.LANDING);
  };

  // --- ACTIONS ADMIN ---
  const handleActivate = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "active",
        isPaid: true,
        activatedAt: new Date().toISOString()
      });
      alert("Empire ACTIVÉ ! 🚀");
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleDeactivate = async (userId: string) => {
    if(!confirm("Désactiver cet Empire ?")) return;
    try {
      await updateDoc(doc(db, "users", userId), { status: "inactive" });
      alert("Empire Désactivé.");
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleUpdateSettings = async (updates: any) => {
    try {
      await setDoc(doc(db, "platform", "settings"), {
        ...platformSettings,
        ...updates
      }, { merge: true });
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (userId: string) => {
    if(!confirm("⚠️ SUPPRESSION DÉFINITIVE ?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      alert("Utilisateur supprimé.");
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const filteredUsers = realUsers.filter(u => {
    const match = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === 'unpaid') return match && u.status !== 'active';
    if (filterMode === 'premium') return match && u.status === 'active';
    return match;
  });

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gold-400 font-bold">ACCÈS RESTREINT</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black italic">KING <span className="text-gold-400">CONTROL</span></h1>
        <button onClick={handleLogout} className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition">
          <LogOut size={20} />
        </button>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
          <p className="text-xs text-gray-500 uppercase font-bold">Membres</p>
          <p className="text-2xl font-black">{stats.total}</p>
        </div>
        <div className="bg-[#111] p-4 rounded-2xl border border-gold-400/20">
          <p className="text-xs text-gold-400 uppercase font-bold">Revenus Est.</p>
          <p className="text-2xl font-black text-gold-400">{stats.revenue} $</p>
        </div>
        <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
          <p className="text-xs text-gray-500 uppercase font-bold">Sites Actifs</p>
          <p className="text-2xl font-black">{stats.active}</p>
        </div>
        <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
          <p className="text-xs text-gray-500 uppercase font-bold">Conversion</p>
          <p className="text-2xl font-black">{stats.conversion}%</p>
        </div>
      </div>

      {/* SETTINGS QUICK BAR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#111] p-6 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Megaphone size={16} className="text-gold-400"/> ANNONCE ARÈNE</h3>
                  <button onClick={() => handleUpdateSettings({ isAnnouncementActive: !platformSettings.isAnnouncementActive })}>
                      {platformSettings.isAnnouncementActive ? <ToggleRight className="text-gold-400" size={32}/> : <ToggleLeft size={32} className="text-gray-600"/>}
                  </button>
              </div>
              <textarea 
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-gold-400 outline-none"
                value={platformSettings.announcementText}
                onChange={(e) => handleUpdateSettings({ announcementText: e.target.value })}
                rows={2}
              />
          </div>
          <div className="bg-[#111] p-6 rounded-3xl border border-white/5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><DollarSign size={16} className="text-gold-400"/> PRIX DU SERVICE ($)</h3>
              <div className="flex gap-2">
                  <input 
                    type="number" 
                    className="flex-1 bg-black border border-white/10 rounded-xl p-3 font-bold"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                  />
                  <button 
                    onClick={() => handleUpdateSettings({ currentPrice: Number(priceInput) })}
                    className="bg-gold-400 text-black font-bold px-6 rounded-xl hover:bg-gold-500 transition"
                  >
                    UPDATE
                  </button>
              </div>
          </div>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-[#111] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2">
                <button onClick={() => setFilterMode('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filterMode === 'all' ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>TOUS</button>
                <button onClick={() => setFilterMode('unpaid')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filterMode === 'unpaid' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400'}`}>INACTIFS</button>
                <button onClick={() => setFilterMode('premium')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filterMode === 'premium' ? 'bg-gold-400 text-black' : 'bg-white/5 text-gray-400'}`}>ACTIFS</button>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-600" size={16}/>
                <input 
                    type="text" 
                    placeholder="Chercher un Empire..." 
                    className="w-full bg-black border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-gold-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-500 border-b border-white/5">
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="p-4">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {u.status === 'active' ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {u.status !== 'active' ? (
                      <button onClick={() => handleActivate(u.id)} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition">
                        <CheckCircle size={18}/>
                      </button>
                    ) : (
                      <button onClick={() => handleDeactivate(u.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                        <Ban size={18}/>
                      </button>
                    )}
                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-white/5 text-gray-500 rounded-lg hover:bg-red-600 hover:text-white transition">
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
