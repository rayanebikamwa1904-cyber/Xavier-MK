import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, ArrowRight, Loader, ChevronLeft } from 'lucide-react';
import { AppView } from '../types';

interface LoginPageProps {
  onNavigate: (view: AppView) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Veuillez entrer votre email pour réinitialiser le mot de passe.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (error) {
      setError("Erreur lors de l'envoi de l'email de réinitialisation. Veuillez vérifier votre adresse email.");
      console.error("Password reset error:", error);
    } finally {
      // If a loading state was used for reset, it would be set to false here.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Check for admin email
      if (email === "benjibikamwa@gmail.com") {
        onNavigate(AppView.ADMIN);
      } else {
        onNavigate(AppView.WIZARD);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Email ou mot de passe incorrect. Veuillez réessayer.");
      } else if (err.code === "auth/wrong-password") {
        setError("Mot de passe incorrect. Veuillez réessayer.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format d'email invalide. Veuillez vérifier votre adresse.");
      } else {
        setError("Une erreur inattendue est survenue. Veuillez réessayer plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black"></div>
      
      <button 
        onClick={() => onNavigate(AppView.LANDING)}
        className="absolute top-6 left-6 p-2 text-white/50 hover:text-white transition z-50 flex items-center gap-2"
      >
        <ChevronLeft size={20} /> Retour
      </button>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-gray-400 text-sm">Bon retour parmi nous.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm text-center">{error}</div>}

        {resetSent && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded mb-6 text-sm text-center">Email de réinitialisation envoyé !</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-gold-400 transition" size={18} />
            <input 
              type="email" 
              placeholder="Email"
              className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 text-white focus:border-gold-400 focus:outline-none transition"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-gold-400 transition" size={18} />
            <input 
              type="password" 
              placeholder="Mot de passe"
              className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 text-white focus:border-gold-400 focus:outline-none transition"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="text-right">
            <button type="button" onClick={handlePasswordReset} className="text-xs text-gray-400 hover:text-gold-400 transition hover:underline">Mot de passe oublié ?</button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-lg shadow-lg transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? <Loader className="animate-spin"/> : <>Se Connecter <ArrowRight size={20}/></>}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Pas encore de compte ? <button onClick={() => onNavigate(AppView.REGISTER)} className="text-gold-400 hover:underline">S'inscrire</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;