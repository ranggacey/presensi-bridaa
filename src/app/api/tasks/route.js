import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Ambil semua tugas user yang login
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    const query = { userId: session.user.id };
    if (status && ['pending', 'review', 'revision', 'done'].includes(status)) {
      query.status = status;
    }
    
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      Task.countDocuments(query),
    ]);
    
    return NextResponse.json({ 
      tasks, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { message: 'Error fetching tasks', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Upload tugas baru
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const { title, description, file, fileName } = body;
    
    // Validasi
    if (!title || !description) {
      return NextResponse.json(
        { message: 'Judul dan deskripsi tugas diperlukan' },
        { status: 400 }
      );
    }
    
    // Buat tugas baru
    const task = await Task.create({
      userId: session.user.id,
      title,
      description,
      file: file || '',
      fileName: fileName || '',
      status: 'pending',
      submittedAt: new Date(),
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('userId', 'name email')
      .lean();
    
    return NextResponse.json({ 
      message: 'Tugas berhasil diupload',
      task: populatedTask 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { message: 'Error creating task', error: error.message },
      { status: 500 }
    );
  }
}

