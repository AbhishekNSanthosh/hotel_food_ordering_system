
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
}

interface Order {
    _id: string;
    tableNumber: string;
    items: OrderItem[];
    status: string;
    createdAt: string;
    totalAmount: number;
}

export default function BillingDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                const billingOrders = data.filter((o: Order) => ['Delivered', 'Ready'].includes(o.status));
                setOrders(billingOrders);
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
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-xl font-bold">Billing Dashboard</h1>
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
                <div className="px-4 text-center sm:px-0">
                    {orders.length === 0 ? (
                        <p className="text-gray-500 mt-10">No orders for billing.</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white overflow-hidden shadow rounded-lg border border-l-4 border-l-green-500">
                                    <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Table #{order.tableNumber}
                                        </h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="px-4 py-4 space-y-4">
                                        <div className="py-2 border-b border-gray-100">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-gray-600">
                                                    <span>{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                                            <span>Total:</span>
                                            <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => updateStatus(order._id, 'Paid')}
                                                className="w-full bg-green-600 text-white py-3 rounded-md font-bold text-lg hover:bg-green-700 shadow-md"
                                            >
                                                Mark Paid & Close
                                            </button>
                                        </div>
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
