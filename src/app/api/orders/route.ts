
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();

        // Basic validation could be added here
        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
        }

        const order = await Order.create(body);
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Order error:', error);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

export async function GET() {
    await dbConnect();
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
