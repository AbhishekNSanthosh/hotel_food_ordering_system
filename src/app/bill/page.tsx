"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Receipt, ChevronLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

function BillContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?tableNumber=${tableNumber}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out Cancelled and already Paid orders (assuming 'Paid' removes them from active billing)
          const activeOrders = data.filter((o: Order) => 
            ['Preparing', 'Ready', 'Delivered'].includes(o.status)
          );
          setOrders(activeOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Poll every 15 seconds to keep bill updated
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [tableNumber]);

  // Aggregate items from all active orders
  let aggregatedItems: { name: string; quantity: number; price: number }[] = [];
  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = aggregatedItems.find(i => i.name === item.name && i.price === item.price);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        aggregatedItems.push({ ...item });
      }
    });
  });

  const subtotal = aggregatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const serviceCharge = subtotal * 0.02; // 2% Service Charge
  const grandTotal = subtotal + tax + serviceCharge;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header tableNumber={tableNumber} />
      
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-between mb-8">
            <Link href={`/?table=${tableNumber}`} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-full px-4 py-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Menu</span>
            </Link>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 text-gray-500 font-bold">Loading your bill...</p>
             </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-200 px-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No Active Bill</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">You don't have any active orders to bill yet.</p>
              <Link href={`/?table=${tableNumber}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all text-lg">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-8 pb-0 text-center border-b-2 border-dashed border-gray-200 mb-6">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Hotel Delish - Fine Dining</h2>
                  <p className="text-gray-500 text-sm">45 Gourmet Avenue, Downtown</p>
                  <p className="text-gray-500 text-sm">Phone: +91 98765 12345 | Web: www.hoteldelish.com</p>
                  <p className="text-gray-500 text-sm">Table #{tableNumber}</p>
                  <p className="text-gray-500 flex items-center justify-center gap-2 my-4">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="font-bold text-xs uppercase tracking-widest">Live Bill Preview</span>
                  </p>
              </div>

              <div className="px-8 mb-6">
                  <table className="w-full text-sm">
                      <thead>
                          <tr className="border-b-2 border-gray-900 text-left">
                              <th className="pb-3 pt-2 font-bold uppercase text-[11px] tracking-wider text-gray-500">Item Name</th>
                              <th className="pb-3 pt-2 text-center font-bold uppercase text-[11px] tracking-wider text-gray-500">Qty</th>
                              <th className="pb-3 pt-2 text-right font-bold uppercase text-[11px] tracking-wider text-gray-500">Amount</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {aggregatedItems.map((item, idx) => (
                              <tr key={idx}>
                                  <td className="py-4 font-semibold text-gray-800">{item.name}</td>
                                  <td className="py-4 text-center text-gray-600 font-medium">{item.quantity}</td>
                                  <td className="py-4 text-right font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="px-8 border-t-2 border-dashed border-gray-200 pt-6 space-y-3 bg-gray-50">
                  <div className="flex justify-between text-gray-600 font-medium">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium text-sm">
                      <span>GST (5%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium text-sm">
                      <span>Service Charge (2%)</span>
                      <span>₹{serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t-2 border-gray-900 mt-4 pt-4 pb-8">
                      <span className="text-xl font-black text-gray-900 uppercase tracking-widest">Grand Total</span>
                      <span className="text-3xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</span>
                  </div>
              </div>
              
              {/* Payment Info */}
              <div className="bg-gray-900 p-6 text-center text-white space-y-2">
                 <CreditCard className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                 <h3 className="font-bold text-lg">Ready to checkout?</h3>
                 <p className="text-sm text-gray-400">Please proceed to the billing counter or call a waiter for payment using Cash, UPI, or Card.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function BillPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-black text-gray-900">Loading your Bill...</p>
          </div>
        </div>
    }>
      <BillContent />
    </Suspense>
  );
}
