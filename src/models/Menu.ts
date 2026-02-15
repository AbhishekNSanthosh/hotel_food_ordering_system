import mongoose, { Schema, Document } from 'mongoose';

export interface IMenu extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    subCategory?: string;
    image?: string;
    isAvailable: boolean;
    isVeg: boolean;
    spiceLevel?: 'Mild' | 'Medium' | 'Hot';
    createdAt: Date;
    updatedAt: Date;
}

const MenuSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true }, // e.g., 'Starters', 'Main Course', 'Desserts'
        subCategory: { type: String }, // e.g., 'Soup', 'Curry', 'Rice'
        image: { type: String }, // URL to image
        isAvailable: { type: Boolean, default: true },
        isVeg: { type: Boolean, default: true },
        spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Hot'], default: 'Medium' },
    },
    { timestamps: true }
);

export default mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);
