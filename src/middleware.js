import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Definisikan rute publik yang tidak memerlukan autentikasi
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(path);
  
  // Definisikan rute admin yang memerlukan peran admin
  const isAdminPath = path.startsWith('/admin');
  
  // Ambil token dari session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Jika user belum login dan mencoba mengakses rute yang dilindungi
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Jika user sudah login dan mencoba mengakses rute publik (login/register)
  if (token && (path === '/login' || path === '/register')) {
    // Redirect berdasarkan role
    if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Jika user bukan admin dan mencoba mengakses rute admin
  if (token && isAdminPath && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Konfigurasi rute yang akan diproses oleh middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};