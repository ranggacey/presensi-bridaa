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
    
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user by ID - select only identity fields
    const user = await User.findById(userId)
      .select('name university faculty studyProgram birthPlace birthDate address phoneNumber applicationLetter internshipStartDate createdAt');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create worksheet data structure - format as a more visually appealing report
    const biodata = [
      ['BIODATA PESERTA MAGANG'], // Title row
      [`Tanggal Export: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`], // Export date
      [], // Empty row for spacing
      ['Data Pribadi'], // Section header
      ['Nama Lengkap', ':', user.name || '-'],
      ['Tempat Tanggal Lahir', ':', user.birthPlace && user.birthDate 
        ? `${user.birthPlace}, ${formatDate(user.birthDate)}` 
        : (user.birthPlace || formatDate(user.birthDate) || '-')],
      ['Alamat', ':', user.address || '-'],
      ['No. Telepon', ':', user.phoneNumber || '-'],
      [], // Empty row for spacing
      ['Informasi Akademik'], // Section header
      ['Universitas', ':', user.university || '-'],
      ['Fakultas', ':', user.faculty || '-'],
      ['Program Studi', ':', user.studyProgram || '-'],
      [], // Empty row for spacing
      ['Informasi Magang'], // Section header
      ['Tanggal Mulai Magang', ':', user.internshipStartDate ? formatDate(user.internshipStartDate) : '-'],
      ['Dokumen Pendukung', ':', user.applicationLetter ? 'Tersedia' : 'Tidak Tersedia'],
      [], // Empty row for spacing
      ['Catatan:'], // Notes section
      ['Dokumen ini diekspor dari sistem presensi magang dan berisi informasi identitas peserta.']
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(biodata);
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Label column
      { wch: 5 },  // Separator column
      { wch: 50 }  // Value column
    ];
    ws['!cols'] = colWidths;
    
    // Define merge ranges
    const merges = [
      // Title cell merge (across all columns)
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      // Export date merge
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
      // Section headers merge
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: 9, c: 0 }, e: { r: 9, c: 2 } },
      { s: { r: 14, c: 0 }, e: { r: 14, c: 2 } },
      // Notes section merge
      { s: { r: 18, c: 0 }, e: { r: 18, c: 2 } },
      { s: { r: 19, c: 0 }, e: { r: 19, c: 2 } }
    ];
    
    // Add merge ranges to worksheet
    ws['!merges'] = merges;
    
    // Note: For better styling, would need additional libraries
    // The basic xlsx library doesn't provide full styling capabilities
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Biodata Peserta');
    
    // Generate Excel file
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Sanitize filename - replace spaces and special characters
    const sanitizedName = (user.name || 'user').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Set response headers for Excel download
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="biodata_${sanitizedName}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting user identity to Excel:', error);
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