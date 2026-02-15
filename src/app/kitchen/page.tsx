
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
    notes?: string;
}

export default function KitchenDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                // Kitchen sees Pending, Confirmed, Preparing
                const kitchenOrders = data.filter((o: Order) => ['Pending', 'Confirmed', 'Preparing'].includes(o.status));
                setOrders(kitchenOrders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // 5s poll for kitchen
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
                        <h1 className="text-xl font-bold">Kitchen Dashboard</h1>
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
                        <div className="text-center py-10">
                            <p className="text-gray-500 text-lg">No orders to cook.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-l-yellow-500">
                                    <div className="px-4 py-3 border-b flex justify-between items-center bg-yellow-50/50">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Table #{order.tableNumber}
                                        </h3>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-4 text-left">
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-lg font-medium border-b border-gray-100 pb-2 last:border-0">
                                                    <span>{item.name}</span>
                                                    <span className="bg-gray-100 px-2 py-1 rounded">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.notes && (
                                            <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                                                <strong>Note:</strong> {order.notes}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 text-right">
                                            Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-4 flex gap-3 border-t">
                                        {['Pending', 'Confirmed'].includes(order.status) && (
                                            <button
                                                onClick={() => updateStatus(order._id, 'Preparing')}
                                                className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-bold shadow transition-colors"
                                            >
                                                Start Cooking
                                            </button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button
                                                onClick={() => updateStatus(order._id, 'Ready')}
                                                className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-bold shadow transition-colors"
                                            >
                                                Mark Ready
                                            </button>
                                        )}
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
