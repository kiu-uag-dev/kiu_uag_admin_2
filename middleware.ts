import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { routes } from './config/routes';

// Define role access patterns directly in the middleware file
const roleAccessPatterns = {
  admin: ['/dashboard', '/users', '/settings', '/reports', '/tickets', '/directions', '/schedule'],
  salesagent: ['/dashboard/customers', '/dashboard/sell-ticket'],
  driver: ['/dashboard/qr-scanner']
} as const;

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If no token or no role, redirect to sign in
    if (!token || !token.role) {
      return NextResponse.redirect(new URL(routes.signIn, req.url));
    }

    // Special case for dashboard - only admin should have access
    if (path === '/dashboard') {
      if (token.role !== 'admin') {
        if (token.role === 'driver') {
          return NextResponse.redirect(new URL('/dashboard/qr-scanner', req.url));
        } else if (token.role === 'salesagent') {
          return NextResponse.redirect(new URL('/dashboard/customers', req.url));
        } else {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
      return NextResponse.next();
    }

    // Check if user has access to the current path
    const allowedPaths = roleAccessPatterns[token.role as keyof typeof roleAccessPatterns] || [];
    
    const hasAccess = allowedPaths.some((pattern: string) => path.startsWith(pattern));

    if (!hasAccess) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } else if (token.role === 'driver') {
        return NextResponse.redirect(new URL('/dashboard/qr-scanner', req.url));
      } else if (token.role === 'salesagent') {
        return NextResponse.redirect(new URL('/dashboard/customers', req.url));
      } else {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: routes.signIn,
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: ['/dashboard/:path*']
};
