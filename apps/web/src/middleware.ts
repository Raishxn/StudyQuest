import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// The role hierarchy matches the backend to prevent flashes
const ROLE_HIERARCHY: Record<string, number> = {
    BANNED: -1,
    USER: 0,
    VERIFIED: 1,
    SUPPORT: 2,
    MOD_JUNIOR: 3,
    MOD_SENIOR: 4,
    ADMIN: 5,
    OWNER: 6,
};

function hasMinRole(userRole: string, minRole: string): boolean {
    if (!userRole || !minRole) return false;
    if (userRole === 'BANNED') return false;

    return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('studyquest_auth')?.value;
    const url = request.nextUrl.pathname;

    // Global Check: Banned Users
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            if (decoded.role === 'BANNED' && !url.startsWith('/banido')) {
                return NextResponse.redirect(new URL('/banido', request.url));
            }

            // Admin area protections
            if (url.startsWith('/admin')) {
                const role = decoded.role || 'USER';

                // Base entry to /admin requires minimum SUPPORT
                if (!hasMinRole(role, 'SUPPORT')) {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }

                // Sub-routes specialized permissions
                if (url.startsWith('/admin/roles') && !hasMinRole(role, 'MOD_SENIOR')) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
                if (url.startsWith('/admin/moderation') && !hasMinRole(role, 'MOD_JUNIOR')) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
            }

        } catch (err) {
            // Invalid token, wipe it and redirect to login if accessing protected route
            if (url.startsWith('/admin') || url.startsWith('/dashboard')) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('studyquest_auth');
                return response;
            }
        }
    } else if (url.startsWith('/admin')) {
        // No token, no admin access
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*'],
};
