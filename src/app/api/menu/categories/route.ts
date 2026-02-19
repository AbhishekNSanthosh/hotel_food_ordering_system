
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Menu from '@/models/Menu';

export async function GET() {
    await dbConnect();
    try {
        const categories = await Menu.distinct('category');
        return NextResponse.json(["All", ...categories.sort()]);
    } catch (error) {
        console.error('Fetch categories error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
