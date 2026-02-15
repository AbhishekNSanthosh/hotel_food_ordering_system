
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
}

interface Order {
    _id: string;
    tableNumber: string;
    customerName?: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const logout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        <button
                            onClick={logout}
                            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    {orders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 text-lg">No active orders found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Table #{order.tableNumber}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="px-4 py-4">
                                        {order.customerName && (
                                            <p className="text-sm text-gray-500 mb-2">Customer: <span className="font-medium text-gray-900">{order.customerName}</span></p>
                                        )}
                                        <div className="border-t border-b py-2 my-2 space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-gray-700">
                                                    <span>{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-900 mt-2">
                                            <span>Total:</span>
                                            <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Preparing">Preparing</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
