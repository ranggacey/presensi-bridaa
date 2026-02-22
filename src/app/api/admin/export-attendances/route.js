import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import ExcelJS from 'exceljs';

export async function GET(request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const username = searchParams.get('username');
    const status = searchParams.get('status');
    
    // Build query filter
    const query = {};
    
    // Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    // Status filter
    if (status) {
      // Map frontend status to database status
      const statusMap = {
        'on-time': 'present',
        'late': 'late',
        'absent': 'absent'
      };
      query.status = statusMap[status] || status;
    }
    
    // Username filter requires looking up user IDs
    if (username) {
      const users = await User.find({
        $or: [
          { username: { $regex: username, $options: 'i' } },
          { name: { $regex: username, $options: 'i' } },
          { email: { $regex: username, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      if (userIds.length === 0) {
        // No matching users, so return empty Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistem Presensi';
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet('Attendance Data');
        worksheet.addRow(['No data found matching your filters']);
        const buffer = await workbook.xlsx.writeBuffer();
        
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="attendance-data.xlsx"`
          }
        });
      }
      
      query.userId = { $in: userIds };
    }
    
    // Fetch attendance records with user data
    const attendances = await Attendance.find(query).sort({ date: -1 }).lean();
    
    // Load all users in one go to avoid N+1 queries
    const userIds = [...new Set(attendances.map(a => a.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    
    // Create a lookup map for users
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // Map database status to display status
    const statusMap = {
      'present': 'Tepat Waktu',
      'late': 'Terlambat',
      'absent': 'Tidak Hadir'
    };
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Presensi';
    workbook.created = new Date();
    
    // Add worksheet
    const worksheet = workbook.addWorksheet('Data Presensi');
    
    // Set standard check-in time (08:30 AM)
    const standardCheckInHour = 8;
    const standardCheckInMinute = 30;
    
    // Define columns in the format requested (like the traditional spreadsheet layout)
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'name', width: 25 },
      { header: 'TTL', key: 'birthInfo', width: 20 },
      { header: 'Alamat', key: 'address', width: 35 },
      { header: 'Universitas', key: 'university', width: 25 },
      { header: 'Fakultas', key: 'faculty', width: 25 },
      { header: 'Program Studi', key: 'studyProgram', width: 25 },
      { header: 'Tanggal Masuk Magang', key: 'internshipStartDate', width: 20 },
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Jam Masuk', key: 'checkInTime', width: 15 },
      { header: 'Jam Pulang', key: 'checkOutTime', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Keterlambatan', key: 'latenessDuration', width: 20 },
      { header: 'Keterangan', key: 'notes', width: 30 }
    ];
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Apply column headers with A, B, C, etc.
    const columnHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      if (colNumber <= columnHeaders.length) {
        cell.value = `${columnHeaders[colNumber-1]}. ${cell.value}`;
      }
    });
    
    // Add data rows
    attendances.forEach((attendance, index) => {
      const user = userMap[attendance.userId.toString()] || {};
      
      // Calculate lateness if status is 'late'
      let latenessDuration = '';
      if (attendance.status === 'late' && attendance.checkInTime) {
        const checkInTime = new Date(attendance.checkInTime);
        const standardTime = new Date(attendance.date);
        standardTime.setHours(standardCheckInHour, standardCheckInMinute, 0, 0);
        
        const diffMs = checkInTime - standardTime;
        
        if (diffMs > 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          if (hours > 0) {
            latenessDuration = `${hours} jam ${minutes} menit ${seconds} detik`;
          } else if (minutes > 0) {
            latenessDuration = `${minutes} menit ${seconds} detik`;
          } else {
            latenessDuration = `${seconds} detik`;
          }
        }
      }
      
      worksheet.addRow({
        no: index + 1,
        name: user.name || 'N/A',
        birthInfo: user.birthPlace && user.birthDate ? 
          `${user.birthPlace} ${new Date(user.birthDate).toLocaleDateString('id-ID')}` : 'N/A',
        address: user.address || 'N/A',
        university: user.university || 'N/A',
        faculty: user.faculty || 'N/A',
        studyProgram: user.studyProgram || 'N/A',
        internshipStartDate: user.internshipStartDate ? 
          new Date(user.internshipStartDate).toLocaleDateString('id-ID') : 'N/A',
        date: attendance.date ? new Date(attendance.date).toLocaleDateString('id-ID') : 'N/A',
        checkInTime: attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('id-ID') : 'N/A',
        checkOutTime: attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString('id-ID') : 'N/A',
        status: statusMap[attendance.status] || attendance.status,
        latenessDuration: latenessDuration || (attendance.status === 'late' ? 'Tidak diketahui' : ''),
        notes: attendance.notes || ''
      });
    });
    
    // Auto filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 14 }
    };
    
    // Apply borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Apply alternating row colors for better readability
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFECF0F1' }
          };
        });
      }
    });
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="data-presensi.xlsx"`
      }
    });
    
  } catch (error) {
    console.error('Error exporting attendances to Excel:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 