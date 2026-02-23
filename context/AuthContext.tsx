import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, DocumentData } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;

  impersonateUser: (userId: string) => void;
  clearImpersonation: () => void;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true, 

  impersonateUser: () => {}, 
  clearImpersonation: () => {},
  isImpersonating: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {


    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const godModeUser = localStorage.getItem('godModeUser');
      setIsImpersonating(!!godModeUser);

      setUser(currentUser);

      try {
        if (godModeUser) {
          const docRef = doc(db, "users", godModeUser);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("AuthContext (God Mode): User not found:", godModeUser);
            setUserData(null);
            localStorage.removeItem('godModeUser');
          }
        } else if (currentUser) {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("AuthContext: User data not found:", currentUser.uid);
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error: any) {
        console.error("AuthContext: Error fetching user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user, userData, loading, impersonateUser, clearImpersonation, isImpersonating }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);