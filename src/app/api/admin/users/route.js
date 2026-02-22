import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// GET - Mendapatkan semua user dengan pagination
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    // Calculate pagination offsets
    const skip = (page - 1) * limit;
    
    // Build query object
    const query = {};
    
    // Add search criteria if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add role filter if provided
    if (role) {
      query.role = role;
    }
    
    // Count total documents for pagination
    const total = await User.countDocuments(query);
    
    // Fetch paginated users
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      users,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST - Membuat user baru
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { username, email, password, name, role } = await request.json();
    
    // Validasi input
    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }
    
    // Cek apakah username sudah ada
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username sudah digunakan' },
        { status: 400 }
      );
    }
    
    // Cek apakah email sudah ada
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email sudah digunakan' },
        { status: 400 }
      );
    }
    
    // Buat user baru
    const user = await User.create({
      username,
      email,
      password,
      name,
      role: role || 'user',
    });
    
    // Hapus password dari response
    const newUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    return NextResponse.json(
      { message: 'User berhasil dibuat', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}