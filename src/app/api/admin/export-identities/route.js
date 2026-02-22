import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
    
    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const university = searchParams.get('university') || '';
    
    // Build query object
    const query = {};
    
    // Add search criteria if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { faculty: { $regex: search, $options: 'i' } },
        { studyProgram: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add university filter if provided
    if (university) {
      query.university = university;
    }
    
    // Fetch all users matching the filter
    const users = await User.find(query)
      .select('name university faculty studyProgram birthPlace birthDate address phoneNumber applicationLetter internshipStartDate')
      .sort({ name: 1 });
    
    // Transform data for Excel - only identity information, no system fields
    const data = users.map((user, index) => ({
      'No': index + 1,
      'Nama Lengkap': user.name || '',
      'Tempat Tanggal Lahir': user.birthPlace && user.birthDate 
        ? `${user.birthPlace}, ${formatDate(user.birthDate)}` 
        : (user.birthPlace || formatDate(user.birthDate) || ''),
      'Alamat': user.address || '',
      'No. Telepon': user.phoneNumber || '',
      'Universitas': user.university || '',
      'Fakultas': user.faculty || '',
      'Program Studi': user.studyProgram || '',
      'Tanggal Mulai Magang': user.internshipStartDate ? formatDate(user.internshipStartDate) : ''
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data, {
      header: ['No', 'Nama Lengkap', 'Tempat Tanggal Lahir', 'Alamat', 'No. Telepon', 'Universitas', 'Fakultas', 'Program Studi', 'Tanggal Mulai Magang'],
      skipHeader: true
    });
    
    // Add title row (merged cells for title)
    ws['!ref'] = XLSX.utils.encode_range(
      Object.assign(XLSX.utils.decode_range(ws['!ref']), { s: { r: 0 } })
    );
    
    // Add title and header rows
    XLSX.utils.sheet_add_aoa(ws, [
      [{ v: 'DATA IDENTITAS PESERTA MAGANG', t: 's' }], // Title
      [{ v: 'Tanggal Export: ' + format(new Date(), 'dd MMMM yyyy', { locale: id }), t: 's' }], // Export date
      [], // Empty row for spacing
      ['No', 'Nama Lengkap', 'Tempat Tanggal Lahir', 'Alamat', 'No. Telepon', 'Universitas', 'Fakultas', 'Program Studi', 'Tanggal Mulai Magang'] // Headers
    ], { origin: 'A1' });
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama Lengkap
      { wch: 30 }, // Tempat Tanggal Lahir
      { wch: 30 }, // Alamat
      { wch: 15 }, // No. Telepon
      { wch: 25 }, // Universitas
      { wch: 25 }, // Fakultas
      { wch: 25 }, // Program Studi
      { wch: 20 }  // Tanggal Mulai Magang
    ];
    ws['!cols'] = colWidths;
    
    // Set some row heights
    const rowHeights = {
      '1': { hpt: 30 }, // Title row
      '2': { hpt: 24 }, // Date row
      '4': { hpt: 24 }  // Header row
    };
    ws['!rows'] = rowHeights;
    
    // Define a range for the title cell to merge
    const titleRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } };
    const dateRange = { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } };
    
    // Add merged cells ranges
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(titleRange, dateRange);
    
    // Add some basic styles
    // Define styles (approximation - actual styling needs custom output)
    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center', vertical: 'center' } };
    const headerStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4472C4' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    
    // Note: XLSX doesn't directly support styling in the free version
    // For a styled Excel file, you'd need additional libraries or commercial solutions
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data Identitas');
    
    // Generate Excel file
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set response headers for Excel download
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="data-identitas-peserta-magang.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting identities to Excel:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to format dates
function formatDate(dateString) {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || '';
  }
} 