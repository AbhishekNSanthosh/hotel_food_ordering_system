
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Menu from '@/models/Menu';

export async function POST() {
    try {
        await dbConnect();

        // Clear existing menu
        await Menu.deleteMany({});

        const menuItems = [
            {
                name: 'Margherita Pizza',
                description: 'Classic tomato and mozzarella cheese',
                price: 12.99,
                category: 'Main Course',
                subCategory: 'Pizza',
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
                isVeg: true,
                spiceLevel: 'Mild',
            },
            {
                name: 'Pepperoni Feast',
                description: 'Double pepperoni and extra cheese',
                price: 14.99,
                category: 'Main Course',
                subCategory: 'Pizza',
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
                isVeg: false,
                spiceLevel: 'Medium',
            },
            {
                name: 'Classic Burger',
                description: 'Beef patty, lettuce, tomato, onion, pickles',
                price: 10.99,
                category: 'Main Course',
                subCategory: 'Burger',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
                isVeg: false,
                spiceLevel: 'Medium',
            },
            {
                name: 'Caesar Salad',
                description: 'Romaine lettuce, croutons, parmesan, caesar dressing',
                price: 8.99,
                category: 'Starters',
                subCategory: 'Salad',
                image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80',
                isVeg: true,
                spiceLevel: 'Mild',
            },
            {
                name: 'Spicy Wings',
                description: '6pcs chicken wings with hot sauce',
                price: 9.99,
                category: 'Starters',
                subCategory: 'Chicken',
                image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80',
                isVeg: false,
                spiceLevel: 'Hot',
            },
            {
                name: 'Chocolate Lava Cake',
                description: 'Warm chocolate cake with molten center',
                price: 7.99,
                category: 'Desserts',
                subCategory: 'Cake',
                image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?w=800&q=80',
                isVeg: true,
                spiceLevel: 'Mild',
            },
            {
                name: 'Iced Coffee',
                description: 'Cold brewed coffee with milk/cream',
                price: 4.99,
                category: 'Beverages',
                subCategory: 'Cold',
                image: 'https://images.unsplash.com/photo-1517701604599-bb29b5dd73ad?w=800&q=80',
                isVeg: true,
                spiceLevel: 'Mild',
            },
            {
                name: 'Cola',
                description: 'Refreshing carbonated soft drink',
                price: 2.99,
                category: 'Beverages',
                subCategory: 'Cold',
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80',
                isVeg: true,
                spiceLevel: 'Mild',
            },
        ];

        await Menu.insertMany(menuItems);

        return NextResponse.json({ message: 'Menu seeded successfully', count: menuItems.length });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
    }
}
