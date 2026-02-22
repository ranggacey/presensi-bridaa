'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import DashboardNavbar from '../components/Navbar';
import FaceRecognition from '@/components/FaceRecognition';

export default function FaceRegistrationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('register'); // 'register' or 'update'
  const [brightnessAdjusted, setBrightnessAdjusted] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    if (!session) {
      router.push('/login');
      return;
    }

    // Get the mode from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    if (urlMode === 'update') {
      setMode('update');
    }

    // Check if face data already exists
    const checkFaceData = async () => {
      try {
        const res = await fetch('/api/face/get-data');
        if (res.ok) {
          setMode('update');
        }
      } catch (error) {
        console.error('Error checking face data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFaceData();

    // Adjust screen brightness to maximum for better face detection
    try {
      // Using the Screen Wake Lock API to keep the screen on
      let wakeLockObj = null;
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
          .then((wakeLock) => {
            console.log('Screen Wake Lock is active');
            wakeLockObj = wakeLock;
          })
          .catch(err => {
            console.error(`${err.name}, ${err.message}`);
          });
      }

      // Attempt to maximize brightness using a white overlay
      setBrightnessAdjusted(true);
      
      // Clean up the wake lock when component unmounts
      return () => {
        setBrightnessAdjusted(false);
        if (wakeLockObj) {
          wakeLockObj.release()
            .then(() => {
              console.log('Screen Wake Lock released');
            })
            .catch((err) => {
              console.error(`${err.name}, ${err.message}`);
            });
        }
        
        // Ensure all camera tracks are stopped
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
              stream.getTracks().forEach(track => track.stop());
            })
            .catch(err => {
              console.log('No camera to stop or error accessing camera:', err);
            });
        }
      };
    } catch (error) {
      console.error('Error adjusting brightness:', error);
    }
  }, [session, router]);

  const handleSuccess = () => {
    // Add a small delay to show the success message before redirecting
    setTimeout(() => {
      router.push('/dashboard/profile');
    }, 2000);
  };

  const handleCancel = () => {
    // Stop any active camera streams before navigating away
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.log('No camera to stop or error accessing camera:', err);
        });
    }
    
    router.push('/dashboard/profile');
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="flex items-center justify-center h-screen pt-16">
          <div className="flex flex-col items-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      {/* White background for better face recognition */}
      <div className="pt-24 pb-10 px-4 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {mode === 'update' ? 'Update Data Wajah' : 'Pendaftaran Wajah'}
              </h1>
              <button
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Kembali</span>
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full mx-auto">
                <FaceRecognition
                  mode="register"
                  onSuccess={handleSuccess}
                />
              </div>

              <div className="mt-6 text-center text-gray-600 max-w-md">
                <p>Posisikan wajah Anda di tengah frame dan pastikan pencahayaan cukup.</p>
                <p className="mt-2">Jangan gunakan masker atau kacamata untuk hasil terbaik.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brightness adjustment overlay */}
      {brightnessAdjusted && (
        <div 
          className="fixed inset-0 bg-white opacity-20 pointer-events-none z-10"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
    </>
  );
}