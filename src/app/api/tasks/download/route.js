import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';

/**
 * GET /api/tasks/download?taskId=xxx
 * Mengambil file tugas dan mengirim dengan nama asli (Content-Disposition)
 * supaya browser menyimpan dengan nama yang benar, bukan nama generik Cloudinary.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ message: 'taskId required' }, { status: 400 });
    }

    await connectToDatabase();
    const task = await Task.findById(taskId).lean();
    if (!task) {
      return NextResponse.json({ message: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    const isOwner = task.userId?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (!task.file) {
      return NextResponse.json({ message: 'Tugas ini tidak memiliki file' }, { status: 404 });
    }

    const fileUrl = task.file;
    const fileName = task.fileName || 'file';

    const res = await fetch(fileUrl, { method: 'GET' });
    if (!res.ok) {
      return NextResponse.json(
        { message: 'Gagal mengambil file dari penyimpanan' },
        { status: 502 }
      );
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const blob = await res.arrayBuffer();

    const safeName = fileName.replace(/[\\"]/g, '');
    const disposition = `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
      },
    });
  } catch (error) {
    console.error('Error in tasks/download:', error);
    return NextResponse.json(
      { message: error.message || 'Error downloading file' },
      { status: 500 }
    );
  }
}
