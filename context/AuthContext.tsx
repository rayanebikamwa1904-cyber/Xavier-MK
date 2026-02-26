import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, DocumentData } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  fatalError: Error | null; // Renamed from firebaseInitError for broader use
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, fatalError: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  useEffect(() => {
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
        setUser(currentUser);
        if (currentUser) {
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

  return (
    <AuthContext.Provider value={{ user, userData, loading, fatalError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);