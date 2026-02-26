import React, { useEffect, useState } from 'react';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';
import { CreatorProfile, AppView } from '../types';
import PortfolioPreview from '../components/PortfolioPreview';

export default function Profile({ userId, onNavigate }: { userId: string, onNavigate?: (view: AppView) => void }) {
  const [profileData, setProfileData] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID not provided in URL.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setProfileData(userDocSnap.data() as CreatorProfile);
        } else {
          setError('Profile not found.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-[#FFD700]">
        <Loader2 className="animate-spin" size={40}/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-gray-400">
        <p>Profile data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full max-w-4xl h-full overflow-y-auto custom-scrollbar">
        <PortfolioPreview 
          config={profileData.portfolio}
          phone={profileData.phone}
          creatorId={profileData.id}
          expiryDate={profileData.expiryDate}
          isIsolated={true}
          creatorName={profileData.name}
          creatorData={profileData}
        />
      </div>
    </div>
  );
}
