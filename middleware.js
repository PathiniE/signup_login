import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is in the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // If the user is not authenticated, redirect to the sign-in page
    if (!token) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
  ],
};