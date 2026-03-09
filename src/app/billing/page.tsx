'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, CreditCard, Banknote, Smartphone, Percent, CheckCircle2, LogOut, Receipt, Search } from 'lucide-react';

interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    tableNumber: string;
    customerName?: string;
    items: OrderItem[];
    status: string;
    createdAt: string;
    totalAmount: number;
}

const TAX_RATE = 0.05; // 5% GST
const SERVICE_CHARGE_RATE = 0.02; // 2% Service Charge

export default function BillingDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [discount, setDiscount] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
    const [searchQuery, setSearchQuery] = useState('');
    
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                const billingOrders = data.filter((o: Order) => ['Preparing', 'Ready', 'Delivered'].includes(o.status));
                setOrders(billingOrders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
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
                if (newStatus === 'Paid') {
                    setSelectedOrder(null);
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const logout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const handleApplyDiscount = () => {
        const d = parseFloat(discount);
        if (!isNaN(d) && d >= 0) {
            setAppliedDiscount(d);
        } else {
            setAppliedDiscount(0);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleMarkPaid = () => {
        if (selectedOrder) {
            // Can be expanded to save payment details into the DB
            updateStatus(selectedOrder._id, 'Paid');
        }
    };

    // Calculate totals based on actual item prices to ensure accuracy, or fallback to totalAmount
    const itemSubtotal = selectedOrder?.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0) || 0;
    // Handle cases where item prices might be missing in older orders by using totalAmount if itemSubtotal is 0
    const calculatedSubtotal = itemSubtotal > 0 ? itemSubtotal : (selectedOrder?.totalAmount || 0);

    const taxAmount = calculatedSubtotal * TAX_RATE;
    const serviceCharge = calculatedSubtotal * SERVICE_CHARGE_RATE;
    const finalTotal = Math.max(0, calculatedSubtotal + taxAmount + serviceCharge - appliedDiscount);

    const filteredOrders = orders.filter(o => 
        o.tableNumber.toString().includes(searchQuery) ||
        o._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans print:bg-white print:block">
            {/* Sidebar / Order List - Hidden in Print */}
            <aside className="w-[350px] bg-white border-r border-slate-200 flex flex-col h-screen print:hidden shrink-0">
                <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-indigo-600" />
                            <h1 className="text-xl font-bold text-slate-800">Billing POS</h1>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search table or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                            <p>No actionable orders found</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div 
                                key={order._id}
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setAppliedDiscount(0);
                                    setDiscount('');
                                }}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    selectedOrder?._id === order._id 
                                        ? 'border-indigo-500 bg-indigo-50' 
                                        : 'border-transparent bg-white hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">Table {order.tableNumber}</h3>
                                        <p className="text-xs text-slate-500 font-mono mt-1">#{order._id.slice(-6)}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-medium">{order.items.length} items</span>
                                    <span className="font-bold text-slate-900 border border-slate-200 px-2 py-1 rounded bg-white">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content / Bill Detail - Full width in Print */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 print:h-auto print:bg-white print:overflow-visible">
                {selectedOrder ? (
                    <div className="p-6 md:p-8 flex justify-center print:p-0">
                        
                        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 print:block print:max-w-none">
                            
                            {/* Left Column: Bill Receipt */}
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col print:shadow-none print:border-none print:p-0">
                                
                                {/* Receipt Header */}
                                <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-slate-200">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">The Grand Hotel</h2>
                                    <p className="text-slate-500 text-sm">123 Culinary Hub, Food Street</p>
                                    <p className="text-slate-500 text-sm">Phone: +91 98765 43210</p>
                                    <p className="text-slate-500 text-sm font-semibold mt-4 uppercase tracking-widest text-[10px]">Tax Invoice / Receipt</p>
                                </div>

                                {/* Order Info */}
                                <div className="flex justify-between text-sm mb-6 bg-slate-50 rounded-lg p-4 font-medium print:bg-transparent print:p-0 print:border-none border border-slate-100">
                                    <div>
                                        <p className="text-slate-500 mb-1">Order ID: <span className="text-slate-900 font-bold ml-1 font-mono">#{selectedOrder._id.slice(-8)}</span></p>
                                        <p className="text-slate-500">Date: <span className="text-slate-900 font-bold ml-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 mb-1">Table: <span className="text-slate-900 font-bold text-xl ml-1">{selectedOrder.tableNumber}</span></p>
                                        <p className="text-slate-500">Time: <span className="text-slate-900 font-bold ml-1">{new Date(selectedOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                                    </div>
                                </div>

                                {/* Itemized List */}
                                <div className="flex-1 mb-8">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-slate-900 text-left">
                                                <th className="pb-3 pt-2 font-bold uppercase text-[11px] tracking-wider text-slate-500">Item Name</th>
                                                <th className="pb-3 pt-2 text-center font-bold uppercase text-[11px] tracking-wider text-slate-500">Qty</th>
                                                <th className="pb-3 pt-2 text-right font-bold uppercase text-[11px] tracking-wider text-slate-500">Rate</th>
                                                <th className="pb-3 pt-2 text-right font-bold uppercase text-[11px] tracking-wider text-slate-500">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedOrder.items.map((item, idx) => {
                                                const itemPrice = item.price || 0; // fallback if price missing
                                                const lineTotal = itemPrice * item.quantity;
                                                return (
                                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 font-semibold text-slate-800">{item.name}</td>
                                                        <td className="py-3 text-center text-slate-600 font-medium">{item.quantity}</td>
                                                        <td className="py-3 text-right text-slate-600">₹{itemPrice.toFixed(2)}</td>
                                                        <td className="py-3 text-right font-bold text-slate-900">₹{lineTotal.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Calculations */}
                                <div className="border-t-2 border-dashed border-slate-200 pt-6 space-y-3">
                                    <div className="flex justify-between text-slate-600 font-medium">
                                        <span>Subtotal</span>
                                        <span>₹{calculatedSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 font-medium text-sm">
                                        <span>GST (5%)</span>
                                        <span>₹{taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 font-medium text-sm">
                                        <span>Service Charge (2%)</span>
                                        <span>₹{serviceCharge.toFixed(2)}</span>
                                    </div>
                                    {appliedDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 font-bold">
                                            <span>Discount Applied</span>
                                            <span>- ₹{appliedDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center border-t-2 border-slate-900 pt-4 mt-2">
                                        <span className="text-xl font-black text-slate-900 uppercase tracking-widest">Grand Total</span>
                                        <span className="text-3xl font-black text-slate-900">₹{finalTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Print Mode payment status */}
                                    <div className="hidden print:flex justify-between items-center pt-6 mt-6 border-t border-slate-200 font-bold uppercase tracking-wider text-sm">
                                        <span>Payment Status:</span>
                                        <span className={status === "Paid" ? "text-slate-900" : "text-slate-500"}>Pending Settlement</span>
                                    </div>
                                </div>
                                
                                <div className="mt-8 text-center text-sm font-medium text-slate-400 border-t border-slate-100 pt-6 print:block">
                                    <p>Thank you for dining with us!</p>
                                    <p className="text-xs mt-1 uppercase tracking-widest">Please visit again</p>
                                </div>
                            </div>

                            {/* Right Column: Setup & Actions - Hidden in Print */}
                            <div className="flex flex-col gap-6 print:hidden">
                                
                                {/* Discount Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                                        <Percent className="w-4 h-4" /> Apply Discount
                                    </h3>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                            <input 
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                placeholder="Amount"
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold transition-all"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleApplyDiscount}
                                            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Options */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Payment Method</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button 
                                            onClick={() => setPaymentMethod('Cash')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'Cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <Banknote className="w-6 h-6 mb-2" />
                                            <span className="font-bold text-sm">Cash</span>
                                        </button>
                                        <button 
                                            onClick={() => setPaymentMethod('UPI')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'UPI' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <Smartphone className="w-6 h-6 mb-2" />
                                            <span className="font-bold text-sm">UPI</span>
                                        </button>
                                        <button 
                                            onClick={() => setPaymentMethod('Card')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'Card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <CreditCard className="w-6 h-6 mb-2" />
                                            <span className="font-bold text-sm">Card</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto space-y-3">
                                    <button 
                                        onClick={handlePrint}
                                        className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Printer className="w-5 h-5" />
                                        Print Bill
                                    </button>
                                    <button 
                                        onClick={handleMarkPaid}
                                        className="w-full py-5 bg-emerald-600 text-white font-black text-lg rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-6 h-6" />
                                        Settle & Complete
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 print:hidden p-8 text-center bg-slate-50">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-slate-200">
                            <Receipt className="w-16 h-16 opacity-40 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">Ready for Checkout</h2>
                        <p className="text-slate-500 font-medium max-w-sm">Select an active order from the sidebar to generate a bill, apply discounts, and process payment.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
