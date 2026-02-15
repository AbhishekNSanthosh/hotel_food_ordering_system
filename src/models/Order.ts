import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    menuItem: mongoose.Types.ObjectId;
    quantity: number;
    name: string; // Store name in case menu item is deleted/changed
    price: number; // Store price at time of order
}

export interface IOrder extends Document {
    tableNumber: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Pending' | 'Paid';
    customerNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        tableNumber: { type: String, required: true },
        items: [
            {
                menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid'],
            default: 'Pending',
        },
        customerNote: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
