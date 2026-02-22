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
    
    // Get attendance ID from query parameters
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get('attendanceId');
    
    if (!attendanceId) {
      return NextResponse.json(
        { message: 'Attendance ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch attendance record with user data
    const attendance = await Attendance.findById(attendanceId).lean();
    
    if (!attendance) {
      return NextResponse.json(
        { message: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    // Get user information
    const user = await User.findById(attendance.userId).lean();
    
    // Map database status to display status
    const statusMap = {
      'present': 'Tepat Waktu',
      'late': 'Terlambat',
      'absent': 'Tidak Hadir'
    };
    
    // Set standard check-in time (08:30 AM)
    const standardCheckInHour = 8;
    const standardCheckInMinute = 30;
    
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
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Presensi';
    workbook.created = new Date();
    
    // Add worksheet
    const worksheet = workbook.addWorksheet('Attendance Data');
    
    // Add header row
    worksheet.columns = [
      { header: 'Informasi', key: 'info', width: 25 },
      { header: 'Detail', key: 'detail', width: 50 }
    ];
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add data sections with clear section headers
    // Personal Information Section
    worksheet.addRow({ info: '--- INFORMASI PRIBADI ---', detail: '' });
    worksheet.getRow(worksheet.rowCount).font = { bold: true, color: { argb: 'FF0000FF' } };
    
    worksheet.addRow({ info: 'Nama', detail: user?.name || 'N/A' });
    worksheet.addRow({ info: 'Username', detail: user?.username || 'N/A' });
    worksheet.addRow({ info: 'Email', detail: user?.email || 'N/A' });
    worksheet.addRow({ info: 'Alamat', detail: user?.address || 'N/A' });
    worksheet.addRow({ info: 'Tempat, Tanggal Lahir', detail: user?.birthPlace && user?.birthDate ? 
      `${user.birthPlace}, ${new Date(user.birthDate).toLocaleDateString('id-ID')}` : 'N/A' });
    worksheet.addRow({ info: 'Nomor Telepon', detail: user?.phoneNumber || 'N/A' });
    
    // Education Information Section
    worksheet.addRow({ info: '--- INFORMASI PENDIDIKAN ---', detail: '' });
    worksheet.getRow(worksheet.rowCount).font = { bold: true, color: { argb: 'FF0000FF' } };
    
    worksheet.addRow({ info: 'Universitas', detail: user?.university || 'N/A' });
    worksheet.addRow({ info: 'Fakultas', detail: user?.faculty || 'N/A' });
    worksheet.addRow({ info: 'Program Studi', detail: user?.studyProgram || 'N/A' });
    worksheet.addRow({ info: 'Tanggal Masuk Magang', detail: user?.internshipStartDate ? 
      new Date(user.internshipStartDate).toLocaleDateString('id-ID') : 'N/A' });
    
    // Attendance Information Section
    worksheet.addRow({ info: '--- INFORMASI PRESENSI ---', detail: '' });
    worksheet.getRow(worksheet.rowCount).font = { bold: true, color: { argb: '00800080' } };
    
    worksheet.addRow({ info: 'Tanggal Presensi', detail: attendance.date ? new Date(attendance.date).toLocaleDateString('id-ID') : 'N/A' });
    worksheet.addRow({ info: 'Jam Masuk', detail: attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('id-ID') : 'N/A' });
    worksheet.addRow({ info: 'Jam Keluar', detail: attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString('id-ID') : 'N/A' });
    worksheet.addRow({ info: 'Status', detail: statusMap[attendance.status] || attendance.status });
    
    if (attendance.status === 'late') {
      worksheet.addRow({ info: 'Keterlambatan', detail: latenessDuration || 'Tidak diketahui' });
    }
    
    if (attendance.notes) {
      worksheet.addRow({ info: 'Catatan', detail: attendance.notes });
    }
    
    // Apply styling to all rows
    worksheet.eachRow((row, rowNumber) => {
      // Skip section headers
      if (row.getCell(1).value && !row.getCell(1).value.toString().includes('---')) {
        // Add alternating colors for better readability
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFECF0F1' }
            };
          });
        }
      }
      
      // Add borders to all cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        }
      });
      column.width = Math.min(50, Math.max(12, maxLength + 2));
    });
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="attendance-${attendanceId}.xlsx"`
      }
    });
    
  } catch (error) {
    console.error('Error exporting attendance to Excel:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 