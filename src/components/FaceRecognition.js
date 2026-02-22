'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Custom Alert Component - Smooth & Elegant for BRIDA
const CustomAlert = ({ type, message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          mass: 0.8
        }
      }}
      exit={{ 
        opacity: 0, 
        y: -50, 
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: "easeInOut"
        }
      }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
    >
      <motion.div 
        className={cn(
          "relative rounded-3xl shadow-2xl backdrop-blur-xl border overflow-hidden",
          type === 'success' 
            ? 'bg-white/95 border-emerald-200/50' 
            : type === 'error' 
            ? 'bg-white/95 border-rose-200/50' 
            : 'bg-white/95 border-blue-200/50'
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Gradient Background Overlay */}
        <div className={cn(
          "absolute inset-0 opacity-5",
          type === 'success' 
            ? 'bg-gradient-to-br from-emerald-400 to-teal-400' 
            : type === 'error' 
            ? 'bg-gradient-to-br from-rose-400 to-pink-400' 
            : 'bg-gradient-to-br from-blue-400 to-indigo-400'
        )} />
        
        {/* Success/Error bar on top */}
        <motion.div 
          className={cn(
            "h-1.5",
            type === 'success' ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400' :
            type === 'error' ? 'bg-gradient-to-r from-rose-400 via-red-400 to-pink-400' :
            'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400'
          )}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <div className="relative p-5">
          <div className="flex items-start space-x-4">
            {/* Animated Icon */}
            <motion.div 
              className={cn(
                "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                type === 'success' 
                  ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                  : type === 'error' 
                  ? 'bg-gradient-to-br from-rose-400 to-red-500' 
                  : 'bg-gradient-to-br from-blue-400 to-indigo-500'
              )}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1
                }
              }}
            >
              {type === 'success' ? (
                <motion.svg 
                  className="w-7 h-7 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </motion.svg>
              ) : type === 'error' ? (
                <motion.svg 
                  className="w-7 h-7 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <motion.h3 
                className={cn(
                  "text-xl font-bold mb-2 tracking-tight",
                  type === 'success' ? 'text-emerald-900' :
                  type === 'error' ? 'text-rose-900' :
                  'text-blue-900'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {type === 'success' ? 'Berhasil!' :
                 type === 'error' ? 'Oops!' :
                 'Informasi'}
              </motion.h3>
              <motion.p 
                className="text-sm text-gray-700 leading-relaxed font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                {message}
              </motion.p>
            </div>

            {/* Close Button */}
            {onClose && (
              <motion.button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Brightness Warning Popup - BRIDA Semarang Theme
const BrightnessWarning = ({ onClose }) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (countdown === 0) {
      // Use setTimeout to avoid setState during render
      const closeTimer = setTimeout(() => {
        onClose();
      }, 0);
      return () => clearTimeout(closeTimer);
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md z-[9998] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 50 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
          }
        }}
        exit={{ 
          scale: 0.9, 
          opacity: 0,
          transition: { duration: 0.2 }
        }}
        className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-orange-50 opacity-60" />
        
        {/* BRIDA Logo/Badge area */}
        <motion.div 
          className="relative mb-6 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full shadow-lg mb-4">
            <span className="text-white font-bold text-sm tracking-wider">BRIDA KOTA SEMARANG</span>
          </div>
        </motion.div>

        <div className="relative text-center">
          {/* Animated Sun Icon */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 blur-lg opacity-50" />
            <svg className="w-12 h-12 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-gray-800 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Perhatian!
          </motion.h2>
          
          <motion.p 
            className="text-base text-gray-700 mb-6 leading-relaxed px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Silakan <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">cerahkan layar ke maksimal</span> untuk hasil pengenalan wajah yang optimal!
          </motion.p>
          
          {/* Countdown Circle */}
          <motion.div 
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 shadow-inner"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="text-6xl font-black bg-gradient-to-br from-rose-500 to-red-500 bg-clip-text text-transparent mb-2"
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {countdown}
            </motion.div>
            <div className="text-sm font-medium text-gray-600">
              Memulai dalam {countdown} detik...
            </div>
          </motion.div>

          <motion.button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Sudah, Mulai Sekarang!</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function FaceRecognition({ onSuccess, mode = 'verify', purpose = 'check-in' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [message, setMessage] = useState('Memuat model pengenalan wajah...');
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('idle'); // idle, success, error
  const [confidence, setConfidence] = useState(0);
  const [faceapi, setFaceapi] = useState(null);
  const [showBrightnessWarning, setShowBrightnessWarning] = useState(true);
  const [showAlert, setShowAlert] = useState(null); // { type, message }

  // Load model face-api.js and auto-start
  useEffect(() => {
    // Pastikan kode hanya dijalankan di browser
    if (typeof window === 'undefined') return;

    const loadModelsAndStart = async () => {
      // Wait for brightness warning to close
      if (showBrightnessWarning) return;

      setIsLoading(true);
      setMessage('Memuat model pengenalan wajah...');

      try {
        // Import face-api.js secara dinamis
        const faceapiModule = await import('face-api.js');
        setFaceapi(faceapiModule);

        // Tentukan path ke model
        const MODEL_URL = '/models';

        // Load model yang diperlukan
        await Promise.all([
          faceapiModule.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapiModule.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapiModule.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        // Jika mode verifikasi, load data wajah pengguna
        if (mode === 'verify') {
          await loadFaceData(faceapiModule);
        }

        setMessage('Model berhasil dimuat. Memulai kamera...');
        setIsLoading(false);
        
        // Auto-start camera after model loaded
        await startVideo();
      } catch (error) {
        console.error('Error loading models:', error);
        setMessage('Gagal memuat model. Silakan refresh halaman.');
        setDetectionStatus('error');
        setShowAlert({ type: 'error', message: 'Gagal memuat model pengenalan wajah. Silakan refresh halaman.' });
        setIsLoading(false);
      }
    };

    loadModelsAndStart();

    // Cleanup
    return () => {
      stopCamera();
    };
  }, [mode, showBrightnessWarning]);

  // Load data wajah pengguna dari server
  const loadFaceData = async (faceapiInstance) => {
    try {
      const response = await fetch('/api/face/get-data');

      if (!response.ok) {
        console.error('Response not OK:', await response.text());
        throw new Error('Gagal mengambil data wajah');
      }

      const data = await response.json();

      if (!data.faceData) {
        setMessage('Data wajah tidak ditemukan. Silakan daftar wajah terlebih dahulu.');
        return;
      }

      // Buat face matcher dari data yang disimpan
      const labeledDescriptors = new faceapiInstance.LabeledFaceDescriptors(
        'user',
        [new Float32Array(data.faceData)]
      );

      // Gunakan threshold 0.3 untuk 70% confidence (karena confidence = 1 - distance)
      const matcher = new faceapiInstance.FaceMatcher(labeledDescriptors, 0.3);
      setFaceMatcher(matcher);

    } catch (error) {
      console.error('Error loading face data:', error);
      setMessage('Gagal memuat data wajah. Silakan refresh halaman.');
      setDetectionStatus('error');
    }
  };

  // Detect face - simplified without blink detection
  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.readyState === 4 || !faceapi) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set dimensi canvas sesuai video
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      // Ubah parameter deteksi untuk meningkatkan sensitivitas dan keamanan
      const detectionOptions = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.9, // Tingkatkan minimal confidence dari 0.3 ke 0.5
        maxResults: 1 // Batasi hasil deteksi
      });

      // Deteksi wajah dengan parameter yang diubah
      const detections = await faceapi.detectAllFaces(video, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();

      // Resize hasil deteksi ke ukuran tampilan
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gambar hasil deteksi dengan warna yang lebih menarik
      if (resizedDetections.length > 0) {
        // Kustomisasi tampilan deteksi
        ctx.strokeStyle = '#0073f5';
        ctx.lineWidth = 3;

        resizedDetections.forEach(detection => {
          const box = detection.detection.box;
          ctx.beginPath();
          ctx.rect(box.x, box.y, box.width, box.height);
          ctx.stroke();

          // Tambahkan efek glow
          ctx.shadowColor = '#0073f5';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = 'rgba(0, 115, 245, 0.7)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      }

      // Proses berdasarkan mode - langsung proses tanpa liveness check
      if (mode === 'register' && detections.length > 0) {
        // Mode registrasi: simpan data wajah
        handleRegisterFace(detections[0].descriptor);
      } else if (mode === 'verify' && detections.length > 0 && faceMatcher) {
        // Mode verifikasi: verifikasi wajah
        handleVerifyFace(detections[0], faceMatcher);
      } else if (detections.length === 0) {
        setMessage('Tidak ada wajah terdeteksi. Posisikan wajah Anda di tengah frame.');
        setConfidence(0); // Reset confidence when no face is detected
      } else if (detections.length > 1) {
        setMessage('Terdeteksi lebih dari satu wajah. Pastikan hanya wajah Anda yang terlihat.');
      } else if (mode === 'verify') {
        setMessage(`Posisikan wajah Anda di tengah frame untuk ${purpose === 'check-in' ? 'check-in' : 'check-out'}`);
      }

    } catch (error) {
      console.error('Error during face detection:', error);
    }

    // Lanjutkan deteksi jika masih dalam mode deteksi
    if (isDetecting) {
      requestAnimationFrame(detectFace);
    }
  };

  // Handle registrasi wajah
  const handleRegisterFace = async (descriptor) => {
    try {
      setIsDetecting(false);
      setMessage('Menyimpan data wajah...');
      setDetectionStatus('loading');

      // Konversi descriptor ke array biasa untuk dikirim ke server
      const descriptorArray = Array.from(descriptor);

      const response = await fetch('/api/face/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faceData: descriptorArray }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data wajah');
      }

      setMessage('Data wajah berhasil disimpan!');
      setDetectionStatus('success');

      // Show success alert
      setShowAlert({ 
        type: 'success', 
        message: 'Data wajah Anda berhasil didaftarkan! Anda akan dialihkan...' 
      });

      // Explicitly stop the camera
      stopCamera();

      // Panggil callback onSuccess dengan delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2500);

    } catch (error) {
      console.error('Error saving face data:', error);
      setMessage('Gagal menyimpan data wajah. Silakan coba lagi.');
      setDetectionStatus('error');
      
      // Show error alert
      setShowAlert({ 
        type: 'error', 
        message: 'Gagal menyimpan data wajah. Silakan coba lagi.' 
      });
    }
  };

  // Handle verifikasi wajah dengan threshold yang lebih ketat
  const handleVerifyFace = async (detection, matcher) => {
    // Match wajah yang terdeteksi dengan data yang tersimpan
    const match = matcher.findBestMatch(detection.descriptor);
    const confidenceScore = (1 - match.distance).toFixed(2);
    setConfidence(parseFloat(confidenceScore));

    // Ubah threshold menjadi lebih ketat (dari 0.7 menjadi 0.3)
    // Nilai threshold ini = minimal 70% confidence
    if (match.label === 'user' && match.distance <= 0.3) {
      // Wajah terverifikasi
      setIsDetecting(false);
      setMessage('Wajah terverifikasi!');
      setDetectionStatus('success');

      // Show success alert
      const purposeText = purpose === 'check-in' ? 'Check-in' : 'Check-out';
      setShowAlert({ 
        type: 'success', 
        message: `Wajah terverifikasi! ${purposeText} berhasil. Anda akan dialihkan...` 
      });

      // Explicitly stop the camera
      stopCamera();

      // Panggil callback onSuccess
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2500);
    } else {
      // Wajah tidak cocok - tambahkan pesan yang lebih jelas
      const confidencePercent = (parseFloat(confidenceScore) * 100).toFixed(0);
      let errorMsg = '';
      
      if (match.distance > 0.3 && match.distance < 0.6) {
        errorMsg = `Kemiripan wajah terlalu rendah (${confidencePercent}%). Pastikan pencahayaan baik dan posisi wajah tepat.`;
      } else {
        errorMsg = `Wajah tidak cocok dengan data yang terdaftar (${confidencePercent}%). Silakan coba lagi.`;
      }
      
      setMessage(errorMsg);
      setDetectionStatus('error');
      
      // Show error alert
      setShowAlert({ 
        type: 'error', 
        message: errorMsg 
      });
    }
  };

  // Event handler saat video siap
  const handleVideoPlay = () => {
    requestAnimationFrame(detectFace);
  };

  // Add a dedicated function to stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log('Camera stopped');
    }
  };

  // Reset state when starting camera
  const startVideo = async () => {
    setIsDetecting(true);
    setMessage('Memulai kamera...');
    setDetectionStatus('idle');

    try {
      // Periksa apakah navigator.mediaDevices tersedia
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setMessage(mode === 'register' ? 'Posisikan wajah Anda di tengah frame' : 'Mendeteksi wajah...');
        }
      } else {
        throw new Error('Browser tidak mendukung akses kamera atau diakses melalui HTTP (bukan HTTPS)');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errMsg = 'Gagal mengakses kamera. Pastikan kamera terhubung dan izin diberikan.';
      if (error.name === 'NotAllowedError') {
        errMsg = 'Akses kamera ditolak. Silakan izinkan akses kamera di browser.';
      } else if (error.name === 'NotFoundError') {
        errMsg = 'Tidak ada kamera yang terdeteksi. Pastikan kamera terhubung.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError' || error.message?.toLowerCase().includes('device in use')) {
        errMsg = 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain yang menggunakan kamera, lalu coba lagi.';
      }
      setMessage(errMsg);
      setIsDetecting(false);
      setDetectionStatus('error');
    }
  };

  // Di bagian return
  return (
    <>
      {/* Brightness Warning Popup */}
      <AnimatePresence>
        {showBrightnessWarning && (
          <BrightnessWarning onClose={() => setShowBrightnessWarning(false)} />
        )}
      </AnimatePresence>

      {/* Custom Alert */}
      <AnimatePresence>
        {showAlert && (
          <CustomAlert
            type={showAlert.type}
            message={showAlert.message}
            onClose={() => setShowAlert(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
        {typeof navigator === 'undefined' || (typeof navigator !== 'undefined' && !navigator.mediaDevices) ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Browser Tidak Didukung</h3>
            <p>Fitur ini memerlukan browser modern dengan akses kamera. Pastikan Anda menggunakan browser terbaru dan mengakses melalui HTTPS.</p>
          </div>
        ) : (
          // Komponen utama yang sudah ada
          <motion.div
            className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            {/* BRIDA Header */}
            <div className="relative z-10 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-6 border-b-2 border-rose-100">
              {/* BRIDA Badge */}
              <motion.div 
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-rose-500 to-red-500 rounded-full mb-3 shadow-md"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-white text-xs font-bold tracking-wide">BRIDA KOTA SEMARANG</span>
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-bold text-gray-800 mb-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {mode === 'register' ? '📝 Pendaftaran Wajah' :
                  purpose === 'check-in' ? '👋 Verifikasi Check-in' : '👋 Verifikasi Check-out'}
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {mode === 'register'
                  ? 'Posisikan wajah Anda di tengah frame dengan baik'
                  : purpose === 'check-in'
                    ? 'Hadapkan wajah Anda untuk memulai check-in'
                    : 'Hadapkan wajah Anda untuk check-out'}
              </motion.p>
            </div>

            {/* Video Container with Brighter Background */}
            <div className="relative p-6 bg-white">
              {/* Loading Overlay - BRIDA Theme */}
              {isLoading && (
                <motion.div 
                  className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-white/95 to-rose-50/90 backdrop-blur-sm rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative h-20 w-20 mb-4">
                      {/* Outer ring */}
                      <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-rose-100"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Inner spinning ring */}
                      <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-t-rose-500 border-r-red-500 border-b-transparent border-l-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Center dot */}
                      <motion.div 
                        className="absolute inset-0 m-auto w-3 h-3 bg-gradient-to-br from-rose-500 to-red-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                    <motion.p 
                      className="text-base font-semibold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {message}
                    </motion.p>
                  </div>
                </motion.div>
              )}

            {/* Video Frame with Animated Border - BRIDA Theme */}
            <div className="relative mx-auto overflow-hidden rounded-2xl">
              <motion.div 
                className={cn(
                  "absolute inset-0 z-10 rounded-2xl border-[3px] transition-all duration-500",
                  detectionStatus === 'success' 
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/30" 
                    : detectionStatus === 'error' 
                    ? "border-rose-500 shadow-lg shadow-rose-500/30" 
                    : "border-rose-400 shadow-lg shadow-rose-400/20"
                )}
                animate={{
                  boxShadow: detectionStatus === 'idle' 
                    ? [
                        "0 0 20px rgba(244, 63, 94, 0.2)",
                        "0 0 30px rgba(244, 63, 94, 0.3)",
                        "0 0 20px rgba(244, 63, 94, 0.2)"
                      ]
                    : undefined
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Animated Corner Accents - BRIDA Colors */}
              <motion.div 
                className={cn(
                  "absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] rounded-tl-lg z-20 transition-colors duration-300",
                  detectionStatus === 'success' ? "border-emerald-500" :
                  detectionStatus === 'error' ? "border-rose-500" :
                  "border-rose-400"
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className={cn(
                  "absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] rounded-tr-lg z-20 transition-colors duration-300",
                  detectionStatus === 'success' ? "border-emerald-500" :
                  detectionStatus === 'error' ? "border-rose-500" :
                  "border-rose-400"
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div 
                className={cn(
                  "absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] rounded-bl-lg z-20 transition-colors duration-300",
                  detectionStatus === 'success' ? "border-emerald-500" :
                  detectionStatus === 'error' ? "border-rose-500" :
                  "border-rose-400"
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.div 
                className={cn(
                  "absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] rounded-br-lg z-20 transition-colors duration-300",
                  detectionStatus === 'success' ? "border-emerald-500" :
                  detectionStatus === 'error' ? "border-rose-500" :
                  "border-rose-400"
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />

              {/* Video Element */}
              <video
                ref={videoRef}
                width="500"
                height="375"
                autoPlay
                muted
                onPlay={handleVideoPlay}
                className="rounded-lg bg-gray-100"
              />
              <canvas
                ref={canvasRef}
                width="500"
                height="375"
                className="absolute top-0 left-0 z-10"
              />
            </div>

            {/* Status Message with Animation - BRIDA Theme */}
            <motion.div
              className={cn(
                "mt-6 p-5 rounded-2xl text-center shadow-lg border-2 transition-all duration-500",
                detectionStatus === 'success' 
                  ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200" 
                  : detectionStatus === 'error' 
                  ? "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200" 
                  : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
              )}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                {detectionStatus === 'success' && (
                  <motion.svg 
                    className="w-5 h-5 text-emerald-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                )}
                {detectionStatus === 'error' && (
                  <motion.svg 
                    className="w-5 h-5 text-rose-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                )}
                {detectionStatus === 'idle' && isDetecting && (
                  <motion.div
                    className="w-2 h-2 bg-rose-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              <p className={cn(
                "font-semibold text-sm leading-relaxed",
                detectionStatus === 'success' ? "text-emerald-700" :
                  detectionStatus === 'error' ? "text-rose-700" :
                    "text-gray-700"
              )}>
                {confidence >= 0.7 && detectionStatus !== 'success' && detectionStatus !== 'error' 
                  ? "✨ Wajah terdeteksi! Memverifikasi..." 
                  : message}
              </p>

              {/* Confidence Meter for Verification - BRIDA Style */}
              {mode === 'verify' && confidence > 0 && (
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between text-xs font-medium mb-2 text-gray-600">
                    <span>Tingkat Kecocokan</span>
                    <span className="font-bold">{(confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className={cn(
                        "h-full transition-all duration-700 rounded-full",
                        confidence >= 0.7 
                          ? "bg-gradient-to-r from-emerald-400 to-green-500" 
                          : confidence >= 0.5 
                          ? "bg-gradient-to-r from-amber-400 to-yellow-500" 
                          : "bg-gradient-to-r from-rose-400 to-red-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
}
