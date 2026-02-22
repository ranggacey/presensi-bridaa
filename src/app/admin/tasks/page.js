'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Untuk counting
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    if (session) {
      fetchTasks();
      fetchAllTasksForCount(); // Fetch semua untuk counting
    }
  }, [session, selectedStatus, page]);

  // Fetch semua tugas untuk counting (tanpa pagination)
  const fetchAllTasksForCount = async () => {
    try {
      const response = await fetch('/api/admin/tasks?limit=1000'); // Ambil banyak untuk counting
      if (response.ok) {
        const data = await response.json();
        setAllTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching all tasks for count:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = selectedStatus === 'all'
        ? `/api/admin/tasks?page=${page}&limit=10`
        : `/api/admin/tasks?status=${selectedStatus}&page=${page}&limit=10`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setPagination(data.pagination || { total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
    setComment('');
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Komentar berhasil ditambahkan');
        setComment('');
        fetchTasks();
        fetchAllTasksForCount(); // Refresh count juga
        // Update selected task
        const updatedResponse = await fetch(`/api/tasks/${selectedTask._id}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setSelectedTask(updatedData.task);
        }
      } else {
        alert('Gagal menambahkan komentar: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const handleMarkDone = async () => {
    if (!selectedTask) return;

    if (!confirm('Apakah Anda yakin ingin menandai tugas ini sebagai selesai?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'done',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Tugas berhasil ditandai sebagai selesai!');
        setShowModal(false);
        setSelectedTask(null);
        fetchTasks();
        fetchAllTasksForCount(); // Refresh count juga
      } else {
        alert('Gagal update status: ' + data.message);
      }
    } catch (error) {
      console.error('Error marking done:', error);
      alert('Error marking task as done');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Menunggu Review',
      review: 'Sedang Direview',
      revision: 'Perlu Revisi',
      done: 'Selesai',
    };
    return texts[status] || status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Kelola Tugas</h1>
      </div>

      {/* Filter Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'review', 'revision', 'done'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status === 'all' ? 'Semua' : getStatusText(status)} 
              {status !== 'all' && ` (${allTasks.filter(t => t.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Belum ada tugas</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleTaskClick(task)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{task.userId?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{format(new Date(task.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                      {task.file && (
                        <>
                          <span>•</span>
                          <a
                            href={task.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Lihat File
                          </a>
                        </>
                      )}
                      {task.comments && task.comments.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-primary-500">{task.comments.length} Komentar</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2">
                Halaman {page} dari {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedTask.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTask.status)}`}>
                      {getStatusText(selectedTask.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Oleh: {selectedTask.userId?.name || 'Unknown'} • {format(new Date(selectedTask.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTask(null);
                    setComment('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi:</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedTask.description}</p>
              </div>

              {selectedTask.file && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">File:</h3>
                  <a
                    href={selectedTask.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                    </svg>
                    <span>{selectedTask.fileName || 'Lihat File'}</span>
                  </a>
                </div>
              )}

              {/* Comments Section */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Komentar:</h3>
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedTask.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                            {comment.commentedByName || 'Admin'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(comment.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada komentar</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tambahkan Komentar (untuk revisi):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  rows="3"
                  placeholder="Masukkan komentar atau instruksi revisi..."
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tambahkan Komentar
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedTask.status !== 'done' && (
                  <button
                    onClick={handleMarkDone}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mark as Done</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTask(null);
                    setComment('');
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

