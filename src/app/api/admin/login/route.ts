
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = await new SignJWT({ username, role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('24h')
                .sign(SECRET_KEY);

            const cookieStore = await cookies();

            // Set both tokens for backward compatibility
            cookieStore.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            cookieStore.set('user_role', 'admin', {
                path: '/',
                maxAge: 60 * 60 * 24
            });

            return NextResponse.json({ message: 'Login successful' });
        } else {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
