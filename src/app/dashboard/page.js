'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import DashboardNavbar from './components/Navbar';

// Komponen StatusCard dengan animasi hover
const StatusCard = ({ title, value, icon, status }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-2">
        <div className={cn(
          "p-2 rounded-full mr-3",
          status === 'present' ? "bg-green-100 text-green-600" :
          status === 'late' ? "bg-yellow-100 text-yellow-600" :
          title === "Check-in" ? "bg-blue-100 text-blue-600" :
          title === "Check-out" ? "bg-purple-100 text-purple-600" :
          "bg-gray-100 text-gray-600"
        )}>
          {icon}
        </div>
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      </div>
      <p className={cn(
        "text-xl font-bold",
        status === 'present' ? "text-green-600" :
        status === 'late' ? "text-yellow-600" :
        status === 'absent' ? "text-red-600" :
        "text-gray-800"
      )}>{value}</p>
    </motion.div>
  );
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [recentTasks, setRecentTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', file: null, fileName: '', fileUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCheckedIn = todayAttendance?.checkInTime ? true : false;
  const isCheckedOut = todayAttendance?.checkOutTime ? true : false;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session) {
      fetchTodayAttendance();
      fetchRecentTasks();
      setLoading(false);
    }
  }, [session]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/today');
      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setRecentTasks((data.tasks || []).slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fetch('/api/upload/task', { method: 'POST', body: fd });
      const data = await response.json();
      if (data.success) {
        setTaskForm(prev => ({ ...prev, file, fileName: data.fileName, fileUrl: data.fileUrl }));
      } else {
        alert('Gagal upload file: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.description) {
      alert('Judul dan deskripsi wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          file: taskForm.fileUrl,
          fileName: taskForm.fileName,
        }),
      });
      if (response.ok) {
        alert('Tugas berhasil diupload!');
        setShowTaskModal(false);
        setTaskForm({ title: '', description: '', file: null, fileName: '', fileUrl: '' });
        fetchRecentTasks();
      } else {
        const data = await response.json();
        alert('Gagal upload tugas: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Error submitting task');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      revision: 'bg-orange-100 text-orange-800',
      done: 'bg-green-100 text-green-800',
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = { pending: 'Menunggu Review', review: 'Sedang Direview', revision: 'Perlu Revisi', done: 'Selesai' };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="flex items-center justify-center h-screen bg-gray-50 pt-24">
          <div className="flex flex-col items-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-rose-500 animate-spin"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="pt-24 pb-10 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex-1">
            {/* Welcome Card with Meteor Effect */}
            <motion.div 
              className="relative overflow-hidden bg-white rounded-2xl shadow-xl mb-8 card-hover-effect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="meteor-effect">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="meteor" 
                    style={{
                      top: `${Math.random() * 80}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 p-8">
                <motion.h1 
                  className="text-3xl font-bold mb-2 text-gradient"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Selamat Datang!
                </motion.h1>
                <motion.p 
                  className="text-xl mb-2 text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {session?.user?.name || 'User'}
                </motion.p>
                <motion.p 
                  className="text-gray-600 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </motion.p>
                <motion.div 
                  className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {currentTime.toLocaleTimeString('id-ID')}
                </motion.div>
              </div>
            </motion.div>

            {/* Attendance Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 card-hover-effect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Presensi Hari Ini
              </h2>

              {/* Check-in / Check-out Banner */}
              {(!isCheckedIn || (isCheckedIn && !isCheckedOut)) && (
                <Link 
                  href={!isCheckedIn ? "/check-in" : "/check-out"} 
                  className="group block mb-6"
                >
                  <motion.div
                    className={cn(
                      "relative overflow-hidden rounded-2xl shadow-lg",
                      !isCheckedIn 
                        ? "bg-gradient-to-r from-rose-500 to-red-600" 
                        : "bg-gradient-to-r from-orange-400 to-rose-500"
                    )}
                    whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
                    
                    <div className="relative flex items-center justify-between px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                          {!isCheckedIn ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg leading-tight">
                            {!isCheckedIn ? 'Check-in' : 'Check-out'}
                          </h3>
                          <p className="text-white/80 text-xs font-medium">
                            {!isCheckedIn ? 'Mulai Kehadiran Anda' : 'Akhiri Kehadiran Anda'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <motion.div 
                          className="w-2.5 h-2.5 bg-white rounded-full"
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  </motion.div>
                </Link>
              )}

              {/* Detail Presensi */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                {todayAttendance ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatusCard 
                      title="Check-in" 
                      value={todayAttendance.checkInTime 
                        ? new Date(todayAttendance.checkInTime).toLocaleTimeString('id-ID') 
                        : '-'}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                    <StatusCard 
                      title="Check-out" 
                      value={todayAttendance.checkOutTime 
                        ? new Date(todayAttendance.checkOutTime).toLocaleTimeString('id-ID') 
                        : '-'}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                    <StatusCard 
                      title="Status" 
                      value={
                        todayAttendance.status === 'present' ? 'Hadir' : 
                        todayAttendance.status === 'late' ? 'Terlambat' : 'Tidak Hadir'
                      }
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      status={todayAttendance.status}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Belum ada data presensi hari ini</p>
                    <p className="text-gray-400 text-xs mt-1">Silakan check-in untuk memulai</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
            {/* Upload Task Section */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 card-hover-effect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold flex items-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tugas Terbaru
                </h2>
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => setShowTaskModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Upload Tugas</span>
                  </motion.button>
                  <Link href="/dashboard/tasks">
                    <motion.span
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center space-x-2 font-medium text-sm cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Lihat Semua</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.span>
                  </Link>
                </div>
              </div>

              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
                  </div>
                </div>
              ) : recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada tugas</p>
                  <p className="text-gray-400 text-sm mt-1">Klik &quot;Upload Tugas&quot; untuk menambahkan tugas baru</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task, index) => (
                    <motion.div
                      key={task._id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-3">
                          <h4 className="font-semibold text-gray-800 truncate">{task.title}</h4>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                            <span>{format(new Date(task.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}</span>
                            {task.file && (
                              <a href={task.file} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>File</span>
                              </a>
                            )}
                            {task.comments && task.comments.length > 0 && (
                              <span className="flex items-center space-x-1 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{task.comments.length}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upload Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upload Tugas Baru</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Masukkan judul tugas"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Tugas *</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="5"
                    placeholder="Jelaskan tugas yang akan dikerjakan..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Tugas (Opsional)</label>
                  <input
                    type="file"
                    onChange={handleTaskFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.zip"
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-2">Mengupload file...</p>}
                  {taskForm.fileName && (
                    <p className="text-sm text-primary-600 mt-2">&#10003; File terupload: {taskForm.fileName}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                  >
                    {submitting ? 'Mengupload...' : 'Upload Tugas'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}