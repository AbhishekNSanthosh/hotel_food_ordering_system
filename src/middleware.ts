
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminToken = request.cookies.get('admin_token');

    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow login page
        if (request.nextUrl.pathname === '/admin/login') {
            if (adminToken) {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            return NextResponse.next();
        }

        // Protect dashboard and other admin routes
        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
