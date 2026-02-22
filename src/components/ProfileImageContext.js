'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Membuat context untuk profile image
const ProfileImageContext = createContext();

export function ProfileImageProvider({ children }) {
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = useState('');
  
  // Fetch profile image when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileImage();
    }
  }, [session]);
  
  // Function to fetch profile image
  const fetchProfileImage = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.profileImage) {
          setProfileImage(data.user.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };
  
  // Function to update profile image
  const updateProfileImage = (newImageUrl) => {
    setProfileImage(newImageUrl);
  };
  
  return (
    <ProfileImageContext.Provider value={{ profileImage, updateProfileImage, fetchProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
}

// Custom hook to use profile image
export function useProfileImage() {
  const context = useContext(ProfileImageContext);
  if (context === undefined) {
    throw new Error('useProfileImage must be used within a ProfileImageProvider');
  }
  return context;
} 