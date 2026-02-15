
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Menu from '@/models/Menu';

export async function GET() {
    await dbConnect();
    try {
        const items = await Menu.find({});
        return NextResponse.json(items);
    } catch (error) {
        console.error('Fetch menu error:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}
