import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
        }

        // Verify HMAC-SHA256 signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            // Mark order as failed
            await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Failed' });
            return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
        }

        // Mark order as paid
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: 'Paid',
                razorpayPaymentId,
                razorpaySignature,
                status: 'Confirmed',
            },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            orderId: order._id,
            tableNumber: order.tableNumber,
        });

    } catch (error) {
        console.error('Payment verify error:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
