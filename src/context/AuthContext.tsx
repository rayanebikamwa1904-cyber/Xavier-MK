import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, firebaseInitializationError } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, DocumentData } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  fatalError: Error | null; 
  impersonateUser: (userId: string) => void;
  clearImpersonation: () => void;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true, 
  fatalError: null, 
  impersonateUser: () => {}, 
  clearImpersonation: () => {},
  isImpersonating: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Handle immediate Firebase initialization errors
    if (firebaseInitializationError) {
      setFatalError(firebaseInitializationError);
      setLoading(false);
      return; // Stop further execution if Firebase failed to init
    }

    let unsubscribe: () => void;
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("AuthContext: Loading timeout (5 seconds). Forcing loading to false.");
        setFatalError(new Error("L'authentification prend trop de temps. Veuillez vérifier votre connexion ou la configuration Firebase."));
        setLoading(false);
      }
    }, 5000); // 5 seconds timeout

    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        const godModeUser = localStorage.getItem('godModeUser');
        if (godModeUser) {
          setIsImpersonating(true);
        } else {
          setIsImpersonating(false);
        }

        setUser(currentUser);

        if (godModeUser) {
          try {
            const docRef = doc(db, "users", godModeUser);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              console.warn("AuthContext (God Mode): User data not found for UID:", godModeUser);
              setUserData(null);
              localStorage.removeItem('godModeUser'); // Clean up if user not found
            }
          } catch (error: any) {
            console.error("AuthContext (God Mode): Error fetching user data:", error);
            setFatalError(error);
            setUserData(null);
            localStorage.removeItem('godModeUser');
          }
        } else if (currentUser) {
          try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              console.warn("AuthContext: User data not found for UID:", currentUser.uid);
              setUserData(null);
            }
          } catch (error: any) {
            console.error("AuthContext: Error fetching user data:", error);
            setFatalError(error);
            setUserData(null);
          } finally {
            setLoading(false);
            clearTimeout(timeoutId);
          }
        } else {
          setUserData(null);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      });
    } catch (error: any) {
      console.error("AuthContext: Error setting up auth state observer:", error);
      setFatalError(error);
      setUser(null);
      setUserData(null);
      setLoading(false);
      clearTimeout(timeoutId);
      unsubscribe = () => {}; // Dummy unsubscribe
    }

    return () => {
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loading]); // Dependency on loading to re-evaluate timeout if loading state changes internally

    const impersonateUser = (userId: string) => {
    localStorage.setItem('godModeUser', userId);
    setIsImpersonating(true);
    // Re-trigger auth state check
    window.location.reload();
  };

  const clearImpersonation = () => {
    localStorage.removeItem('godModeUser');
    setIsImpersonating(false);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, fatalError, impersonateUser, clearImpersonation, isImpersonating }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
