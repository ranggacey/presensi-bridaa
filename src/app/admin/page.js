'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayAttendance: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    pendingIdentities: 0,
    totalInternships: 0,
    universities: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationCode, setRegistrationCode] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    fetchRegistrationCode();
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from API
        const response = await fetch('/api/admin/dashboard-stats');
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers || 0,
            todayAttendance: data.todayAttendance || 0,
            presentToday: data.presentToday || 0,
            lateToday: data.lateToday || 0,
            absentToday: data.absentToday || 0,
            pendingIdentities: data.pendingIdentities || 0,
            totalInternships: data.totalInternships || 0,
            universities: data.universities || []
          });
          
          if (data.attendanceTrend) {
            setAttendanceTrend(data.attendanceTrend);
          } else {
            // Fallback to mock attendance trend data
            setAttendanceTrend([
              { date: subDays(new Date(), 6), present: 28, late: 5, absent: 15 },
              { date: subDays(new Date(), 5), present: 30, late: 3, absent: 15 },
              { date: subDays(new Date(), 4), present: 29, late: 6, absent: 13 },
              { date: subDays(new Date(), 3), present: 31, late: 4, absent: 13 },
              { date: subDays(new Date(), 2), present: 33, late: 2, absent: 13 },
              { date: subDays(new Date(), 1), present: 30, late: 5, absent: 13 },
              { date: new Date(), present: 32, late: 4, absent: 12 }
            ]);
          }
          
          if (data.recentActivities && data.recentActivities.length > 0) {
            setRecentActivities(data.recentActivities);
          } else {
            // Fallback to mock activities data
            setRecentActivities([
              { id: 1, type: 'attendance', user: 'Budi Santoso', action: 'melakukan presensi', time: new Date(), status: 'on-time' },
              { id: 2, type: 'identity', user: 'Dewi Putri', action: 'memperbarui identitas', time: subDays(new Date(), 1), status: 'complete' },
              { id: 3, type: 'registration', user: 'Ahmad Hidayat', action: 'mendaftar sebagai peserta baru', time: subDays(new Date(), 1), status: 'pending' },
              { id: 4, type: 'attendance', user: 'Siti Rahayu', action: 'melakukan presensi', time: subDays(new Date(), 2), status: 'late' },
              { id: 5, type: 'identity', user: 'Reza Pratama', action: 'mengunggah dokumen surat permohonan', time: subDays(new Date(), 3), status: 'complete' }
            ]);
          }
        } else {
          // If API fails, fall back to mock data for development
          console.error('Error fetching dashboard stats, using mock data instead:', await response.text());
          
          // Mock data remains the same as before
          const mockStats = {
            totalUsers: 48,
            todayAttendance: 36,
            presentToday: 32,
            lateToday: 4,
            absentToday: 12,
            pendingIdentities: 5,
            totalInternships: 42,
            universities: [
              { name: 'Universitas Indonesia', count: 12 },
              { name: 'Institut Teknologi Bandung', count: 9 },
              { name: 'Universitas Gadjah Mada', count: 7 },
              { name: 'Universitas Brawijaya', count: 6 },
              { name: 'Universitas Lainnya', count: 14 }
            ]
          };

          const mockActivities = [
            { id: 1, type: 'attendance', user: 'Budi Santoso', action: 'melakukan presensi', time: new Date(), status: 'on-time' },
            { id: 2, type: 'identity', user: 'Dewi Putri', action: 'memperbarui identitas', time: subDays(new Date(), 1), status: 'complete' },
            { id: 3, type: 'registration', user: 'Ahmad Hidayat', action: 'mendaftar sebagai peserta baru', time: subDays(new Date(), 1), status: 'pending' },
            { id: 4, type: 'attendance', user: 'Siti Rahayu', action: 'melakukan presensi', time: subDays(new Date(), 2), status: 'late' },
            { id: 5, type: 'identity', user: 'Reza Pratama', action: 'mengunggah dokumen surat permohonan', time: subDays(new Date(), 3), status: 'complete' }
          ];

          const mockTrend = [
            { date: subDays(new Date(), 6), present: 28, late: 5, absent: 15 },
            { date: subDays(new Date(), 5), present: 30, late: 3, absent: 15 },
            { date: subDays(new Date(), 4), present: 29, late: 6, absent: 13 },
            { date: subDays(new Date(), 3), present: 31, late: 4, absent: 13 },
            { date: subDays(new Date(), 2), present: 33, late: 2, absent: 13 },
            { date: subDays(new Date(), 1), present: 30, late: 5, absent: 13 },
            { date: new Date(), present: 32, late: 4, absent: 12 }
          ];

          setStats(mockStats);
          setRecentActivities(mockActivities);
          setAttendanceTrend(mockTrend);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to mock data when there's an error
        setStats({
          totalUsers: 48,
          todayAttendance: 36,
          presentToday: 32,
          lateToday: 4,
          absentToday: 12,
          pendingIdentities: 5,
          totalInternships: 42,
          universities: [
            { name: 'Universitas Indonesia', count: 12 },
            { name: 'Institut Teknologi Bandung', count: 9 },
            { name: 'Universitas Gadjah Mada', count: 7 },
            { name: 'Universitas Brawijaya', count: 6 },
            { name: 'Universitas Lainnya', count: 14 }
          ]
        });
        
        setRecentActivities([
          { id: 1, type: 'attendance', user: 'Budi Santoso', action: 'melakukan presensi', time: new Date(), status: 'on-time' },
          { id: 2, type: 'identity', user: 'Dewi Putri', action: 'memperbarui identitas', time: subDays(new Date(), 1), status: 'complete' },
          { id: 3, type: 'registration', user: 'Ahmad Hidayat', action: 'mendaftar sebagai peserta baru', time: subDays(new Date(), 1), status: 'pending' },
          { id: 4, type: 'attendance', user: 'Siti Rahayu', action: 'melakukan presensi', time: subDays(new Date(), 2), status: 'late' },
          { id: 5, type: 'identity', user: 'Reza Pratama', action: 'mengunggah dokumen surat permohonan', time: subDays(new Date(), 3), status: 'complete' }
        ]);
        
        setAttendanceTrend([
          { date: subDays(new Date(), 6), present: 28, late: 5, absent: 15 },
          { date: subDays(new Date(), 5), present: 30, late: 3, absent: 15 },
          { date: subDays(new Date(), 4), present: 29, late: 6, absent: 13 },
          { date: subDays(new Date(), 3), present: 31, late: 4, absent: 13 },
          { date: subDays(new Date(), 2), present: 33, late: 2, absent: 13 },
          { date: subDays(new Date(), 1), present: 30, late: 5, absent: 13 },
          { date: new Date(), present: 32, late: 4, absent: 12 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchRegistrationCode = async () => {
    try {
      const response = await fetch('/api/admin/registration-code');
      if (response.ok) {
        const data = await response.json();
        setRegistrationCode(data);
      }
    } catch (error) {
      console.error('Error fetching registration code:', error);
    }
  };

  const generateNewCode = async () => {
    try {
      setCodeLoading(true);
      const response = await fetch('/api/admin/registration-code', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrationCode(data);
        alert('Kode registrasi baru berhasil dibuat!');
      } else {
        const errorData = await response.json();
        alert('Gagal membuat kode: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Error generating code');
    } finally {
      setCodeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard Admin</h1>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/admin/identities">
            <motion.button 
              className="px-4 py-2 rounded-lg bg-primary-500 text-white flex items-center shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Kelola Identitas
            </motion.button>
          </Link>
          <Link href="/admin/attendance">
            <motion.button 
              className="px-4 py-2 rounded-lg bg-green-600 text-white flex items-center shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Data Presensi
            </motion.button>
          </Link>
        </div>
      </div>
      
      {/* Highlight Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Pengguna" 
          value={stats.totalUsers} 
          icon={<UserIcon />} 
          color="blue"
          linkTo="/admin/users"
        />
        <StatCard 
          title="Presensi Hari Ini" 
          value={stats.todayAttendance} 
          icon={<CalendarIcon />} 
          color="green"
          linkTo="/admin/attendance"
        />
        <StatCard 
          title="Hadir & Tepat Waktu" 
          value={stats.presentToday} 
          icon={<CheckIcon />} 
          color="emerald"
          linkTo="/admin/attendance"
        />
        <StatCard 
          title="Terlambat" 
          value={stats.lateToday} 
          icon={<ClockIcon />} 
          color="amber"
          linkTo="/admin/attendance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tren Kehadiran (7 Hari Terakhir)</h2>
          <div className="h-64 mt-4">
            <div className="flex h-full">
              {attendanceTrend.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end items-center">
                  <div className="w-full px-1 space-y-1">
                    <div 
                      className="bg-green-500 w-full rounded-t" 
                      style={{ height: `${(day.present / (day.present + day.late + day.absent)) * 200}px` }}
                      title={`Hadir: ${day.present} orang`}
                    ></div>
                    <div 
                      className="bg-amber-500 w-full" 
                      style={{ height: `${(day.late / (day.present + day.late + day.absent)) * 200}px` }}
                      title={`Terlambat: ${day.late} orang`}
                    ></div>
                    <div 
                      className="bg-red-400 w-full" 
                      style={{ height: `${(day.absent / (day.present + day.late + day.absent)) * 200}px` }}
                      title={`Tidak Hadir: ${day.absent} orang`}
                    ></div>
                  </div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-300 font-medium">
                    {format(day.date, 'dd/MM', { locale: id })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Hadir</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Terlambat</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Tidak Hadir</span>
            </div>
          </div>
        </div>

        {/* University Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Distribusi Universitas</h2>
          <div className="space-y-4">
            {stats.universities.map((university, index) => (
              <div key={index} className="relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{university.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">{university.count} Peserta</span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200 dark:bg-gray-700 mt-1">
                  <div 
                    style={{ width: `${(university.count / stats.totalUsers) * 100}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${index % 2 === 0 ? 'bg-primary-500' : 'bg-primary-400'}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/admin/identities">
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Lihat Detail Identitas
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Registration Code Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Kode Registrasi</h2>
          <button
            onClick={generateNewCode}
            disabled={codeLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {codeLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generate Kode Baru</span>
              </>
            )}
          </button>
        </div>
        {registrationCode && registrationCode.code ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-center">
              <p className="text-sm text-white/80 mb-2">Kode Registrasi Aktif</p>
              <p className="text-4xl font-bold text-white tracking-widest mb-2">{registrationCode.code}</p>
              {registrationCode.hoursRemaining !== undefined && (
                <p className="text-sm text-white/80">
                  Berlaku hingga: {format(new Date(registrationCode.expiresAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                  <br />
                  <span className="text-yellow-200">
                    {registrationCode.isExpired 
                      ? '⚠️ Kode sudah kadaluarsa' 
                      : `⏰ Tersisa: ${registrationCode.hoursRemaining} jam ${registrationCode.minutesRemaining} menit`}
                  </span>
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kode ini akan otomatis berubah setiap 6 jam. Berikan kode ini kepada calon pengguna yang ingin mendaftar.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Belum ada kode registrasi aktif</p>
            <button
              onClick={generateNewCode}
              disabled={codeLoading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {codeLoading ? 'Generating...' : 'Buat Kode Baru'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Access */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAccessCard 
              title="Identitas Baru" 
              value={stats.pendingIdentities}
              icon={<IdentityIcon />} 
              linkTo="/admin/identities?filter=pending"
              color="indigo"
            />
            <QuickAccessCard 
              title="Total Magang Aktif" 
              value={stats.totalInternships}
              icon={<InternshipIcon />} 
              linkTo="/admin/users?status=active"
              color="cyan"
            />
            <QuickAccessCard 
              title="Export Identitas" 
              icon={<ExportIcon />} 
              linkTo="/api/admin/export-identities"
              isAction={true}
              color="emerald"
            />
            <QuickAccessCard 
              title="Export Presensi" 
              icon={<ExportIcon />} 
              linkTo="/api/admin/export-attendances"
              isAction={true}
              color="amber"
            />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <Link href="/admin/attendance">
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Lihat Semua Aktivitas
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, linkTo }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-white",
    green: "from-green-500 to-green-600 text-white",
    emerald: "from-emerald-500 to-emerald-600 text-white",
    amber: "from-amber-500 to-amber-600 text-white",
    red: "from-red-500 to-red-600 text-white",
    indigo: "from-indigo-500 to-indigo-600 text-white",
  };

  return (
    <Link href={linkTo || "#"}>
      <motion.div 
        className={`rounded-xl shadow-md overflow-hidden cursor-pointer transition-all`}
        whileHover={{ y: -5, boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.15)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`p-6 bg-gradient-to-r ${colorClasses[color]}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium opacity-90">{title}</p>
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
            </div>
            <div className="p-3 rounded-full bg-white/20">
              {icon}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 text-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Klik untuk detail</span>
        </div>
      </motion.div>
    </Link>
  );
}

function QuickAccessCard({ title, value, icon, linkTo, isAction = false, color }) {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-800",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-800",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-800",
  };

  return (
    <Link href={linkTo}>
      <motion.div 
        className={`rounded-xl border p-4 ${colorClasses[color]} cursor-pointer`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="p-2 rounded-full mb-2">
            {icon}
          </div>
          <h3 className="font-medium">{title}</h3>
          {value !== undefined && (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
          {isAction && (
            <span className="text-xs mt-1 font-medium">Klik untuk mengunduh</span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function ActivityItem({ activity }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'on-time': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'late': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'complete': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance':
        return (
          <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'identity':
        return (
          <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
        );
      case 'registration':
        return (
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex items-start space-x-3">
      {getActivityIcon(activity.type)}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          <span className="font-semibold">{activity.user}</span> {activity.action}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {format(new Date(activity.time), 'dd MMM yyyy, HH:mm', { locale: id })}
        </p>
      </div>
      
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(activity.status)}`}>
        {activity.status === 'on-time' && 'Tepat Waktu'}
        {activity.status === 'late' && 'Terlambat'}
        {activity.status === 'pending' && 'Menunggu'}
        {activity.status === 'complete' && 'Selesai'}
      </div>
    </div>
  );
}

// Icons
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IdentityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  );
}

function InternshipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
    </svg>
  );
}