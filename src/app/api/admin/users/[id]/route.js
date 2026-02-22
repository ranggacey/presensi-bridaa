import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// GET - Mendapatkan user berdasarkan ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT - Mengupdate user berdasarkan ID
export async function PUT(request, { params }) {
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
    if (!username || !email || !name) {
      return NextResponse.json(
        { message: 'Username, email, dan nama harus diisi' },
        { status: 400 }
      );
    }
    
    // Cek apakah user ada
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Cek apakah username sudah digunakan oleh user lain
    if (username !== user.username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: params.id } });
      if (existingUsername) {
        return NextResponse.json(
          { message: 'Username sudah digunakan' },
          { status: 400 }
        );
      }
    }
    
    // Cek apakah email sudah digunakan oleh user lain
    if (email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: params.id } });
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
    }
    
    // Update user
    user.username = username;
    user.email = email;
    user.name = name;
    user.role = role || user.role;
    
    // Update password jika ada
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    // Hapus password dari response
    const updatedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    return NextResponse.json({
      message: 'User berhasil diupdate',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus user berdasarkan ID
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    await User.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}