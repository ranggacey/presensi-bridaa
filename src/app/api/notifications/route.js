import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Ambil semua notifikasi user yang login
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized', notifications: [], unreadCount: 0 },
        { status: 401 }
      );
    }
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error in notifications:', dbError);
      // Return empty data instead of error to prevent crash
      return NextResponse.json({ 
        notifications: [],
        unreadCount: 0,
        error: 'Database connection failed'
      });
    }
    
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Build query
    const query = { userId: session.user.id };
    if (unreadOnly) {
      query.read = false;
    }
    
    let notifications = [];
    let unreadCount = 0;
    
    try {
      notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      // Count unread
      unreadCount = await Notification.countDocuments({
        userId: session.user.id,
        read: false,
      });
    } catch (queryError) {
      console.error('Error querying notifications:', queryError);
      // Return empty data instead of error
      notifications = [];
      unreadCount = 0;
    }
    
    return NextResponse.json({ 
      notifications: notifications || [],
      unreadCount: unreadCount || 0
    });
  } catch (error) {
    console.error('Error in notifications API:', error);
    // Return empty data instead of error to prevent frontend crash
    return NextResponse.json({ 
      notifications: [],
      unreadCount: 0,
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Mark notifikasi sebagai read
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
    const { notificationId, markAllAsRead } = body;
    
    if (markAllAsRead) {
      // Mark all notifications as read
      await Notification.updateMany(
        { userId: session.user.id, read: false },
        { read: true }
      );
      
      return NextResponse.json({ message: 'All notifications marked as read' });
    } else if (notificationId) {
      // Mark single notification as read
      const notification = await Notification.findOne({
        _id: notificationId,
        userId: session.user.id,
      });
      
      if (!notification) {
        return NextResponse.json(
          { message: 'Notification not found' },
          { status: 404 }
        );
      }
      
      notification.read = true;
      await notification.save();
      
      return NextResponse.json({ message: 'Notification marked as read' });
    } else {
      return NextResponse.json(
        { message: 'notificationId or markAllAsRead required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Error updating notification', error: error.message },
      { status: 500 }
    );
  }
}

