
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    cookieStore.delete('auth_token');
    cookieStore.delete('user_role');
    return NextResponse.json({ message: 'Logged out successfully' });
}
