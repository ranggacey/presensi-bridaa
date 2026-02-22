import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - Ambil detail tugas
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const task = await Task.findById(params.id)
      .populate('userId', 'name email')
      .populate('comments.commentedBy', 'name email')
      .lean();
    
    if (!task) {
      return NextResponse.json(
        { message: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // User hanya bisa lihat tugas sendiri, admin bisa lihat semua
    if (session.user.role !== 'admin' && task.userId._id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { message: 'Error fetching task', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update tugas (untuk admin: tambah komentar, ubah status)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Hanya admin yang bisa update
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Hanya admin yang dapat mengupdate tugas' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const { comment, status } = body;
    
    const task = await Task.findById(params.id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Simpan status sebelumnya untuk notifikasi
    const previousStatus = task.status;
    
    // Jika ada komentar, tambahkan ke array comments
    if (comment && comment.trim()) {
      task.comments.push({
        comment: comment.trim(),
        commentedBy: session.user.id,
        commentedByName: session.user.name,
        createdAt: new Date(),
      });
      
      // Jika ada komentar, ubah status ke revision
      if (task.status === 'pending' || task.status === 'review') {
        task.status = 'revision';
      }
    }
    
    // Update status jika diberikan
    if (status && ['pending', 'review', 'revision', 'done'].includes(status)) {
      task.status = status;
      
      // Jika status done, set completedAt
      if (status === 'done' && !task.completedAt) {
        task.completedAt = new Date();
      }
    }
    
    // Buat notifikasi jika status berubah menjadi done
    if (task.status === 'done' && previousStatus !== 'done') {
      try {
        const Notification = (await import('@/models/Notification')).default;
        await Notification.create({
          userId: task.userId,
          type: 'task_done',
          title: 'Tugas Selesai',
          message: `Tugas "${task.title}" telah ditandai sebagai selesai oleh admin.`,
          link: `/dashboard/tasks`,
          taskId: task._id,
          read: false,
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Jangan gagalkan request jika notifikasi gagal dibuat
      }
    }
    
    // Buat notifikasi jika ada komentar baru (revisi)
    // Notifikasi dibuat setiap kali admin menambahkan komentar baru
    if (comment && comment.trim()) {
      try {
        const Notification = (await import('@/models/Notification')).default;
        await Notification.create({
          userId: task.userId,
          type: 'task_revision',
          title: 'Tugas Perlu Revisi',
          message: `Tugas "${task.title}" memerlukan revisi. Silakan cek komentar dari admin.`,
          link: `/dashboard/tasks`,
          taskId: task._id,
          read: false,
        });
        console.log('✅ Notifikasi revisi berhasil dibuat untuk task:', task._id);
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError);
      }
    }
    
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('userId', 'name email')
      .populate('comments.commentedBy', 'name email')
      .lean();
    
    return NextResponse.json({ 
      message: 'Tugas berhasil diupdate',
      task: updatedTask 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { message: 'Error updating task', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Hapus tugas (opsional, bisa untuk user hapus tugas sendiri)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const task = await Task.findById(params.id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // User hanya bisa hapus tugas sendiri, admin bisa hapus semua
    if (session.user.role !== 'admin' && task.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Hapus file jika ada
    if (task.file) {
      const { deleteFile } = await import('@/lib/fileHelper');
      await deleteFile(task.file);
    }
    
    await Task.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Tugas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { message: 'Error deleting task', error: error.message },
      { status: 500 }
    );
  }
}

