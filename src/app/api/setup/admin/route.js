import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST - Membuat admin pertama (hanya bisa diakses sekali)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Cek apakah sudah ada admin
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return NextResponse.json(
        { message: 'Admin sudah ada, endpoint ini tidak bisa diakses lagi' },
        { status: 400 }
      );
    }
    
    // Buat admin baru dengan data yang diminta
    const admin = await User.create({
      username: 'icikiwir',
      email: 'ranggaicikiwir@gmail.com',
      password: 'icikiwir619',
      name: 'Admin',
      role: 'admin',
    });
    
    // Hapus password dari response
    const newAdmin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    
    return NextResponse.json(
      { message: 'Admin berhasil dibuat', admin: newAdmin },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}