"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Receipt, ChevronLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const router = useRouter();
  const tableNumber = searchParams.get('table') || '1';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const scriptLoaded = useRef(false);

  // Load Razorpay script
  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { scriptLoaded.current = true; };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const key = `table_session_${tableNumber}`;
    const sid = sessionStorage.getItem(key) || "";
    setSessionId(sid);

    const fetchOrders = async () => {
      try {
        const url = sid 
          ? `/api/orders?tableNumber=${tableNumber}&sessionId=${sid}`
          : `/api/orders?tableNumber=${tableNumber}`;
          
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
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
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [tableNumber]);

  // Aggregate items
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
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.02;
  const grandTotal = subtotal + tax + serviceCharge;

  const handlePayNow = async () => {
    if (!sessionId) {
      toast.error("Session information missing. Please re-scan QR.");
      return;
    }

    setIsPaying(true);
    try {
      const res = await fetch("/api/payment/session-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, tableNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate payment");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Hotel Delish",
        description: `Final Bill - Table ${tableNumber}`,
        order_id: data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment Successful!");
              router.push(`/order-status?table=${tableNumber}`);
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header tableNumber={tableNumber} />
      
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-between mb-8">
            <Link href={`/order-status?table=${tableNumber}`} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-full px-4 py-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Orders</span>
            </Link>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 text-gray-500 font-bold">Generating your bill...</p>
             </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-200 px-6 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Bill Settled</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">You don't have any outstanding orders at the moment. Thank you for visiting!</p>
              <Link href={`/?table=${tableNumber}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all text-lg">
                Order More
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-2xl">
              <div className="p-8 pb-6 text-center border-b-2 border-dashed border-gray-200 mb-6 bg-gray-50/50">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Hotel Delish</h2>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-4">Fine Dining Experience</p>
                  <div className="flex justify-center gap-4 text-[10px] font-mono text-gray-400">
                    <span>TBL: #{tableNumber}</span>
                    <span>SID: {sessionId.slice(-6).toUpperCase()}</span>
                  </div>
              </div>

              <div className="px-8 mb-6">
                  <table className="w-full text-sm">
                      <thead>
                          <tr className="border-b border-gray-900 text-left">
                              <th className="pb-3 pt-2 font-bold uppercase text-[10px] tracking-wider text-gray-400">Item</th>
                              <th className="pb-3 pt-2 text-center font-bold uppercase text-[10px] tracking-wider text-gray-400">Qty</th>
                              <th className="pb-3 pt-2 text-right font-bold uppercase text-[10px] tracking-wider text-gray-400">Total</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {aggregatedItems.map((item, idx) => (
                              <tr key={idx}>
                                  <td className="py-4 font-bold text-gray-800">{item.name}</td>
                                  <td className="py-4 text-center text-gray-600 font-medium">{item.quantity}</td>
                                  <td className="py-4 text-right font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="px-8 border-t border-gray-100 pt-6 space-y-3 bg-gray-50/30">
                  <div className="flex justify-between text-gray-500 font-medium">
                      <span>Subtotal</span>
                      <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium text-sm">
                      <span>GST (5%)</span>
                      <span className="font-bold">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium text-sm border-b border-gray-100 pb-3">
                      <span>Service Charge (2%)</span>
                      <span className="font-bold">₹{serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Payable</span>
                      <span className="text-4xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</span>
                  </div>
              </div>
              
              <div className="p-8 pt-4 space-y-4">
                  <button 
                    onClick={handlePayNow}
                    disabled={isPaying}
                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                  >
                    {isPaying ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <CreditCard className="w-6 h-6" />
                    )}
                    <span className="text-lg">Pay Online Now</span>
                  </button>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    <p className="text-[10px] text-gray-500 leading-tight">
                      By paying online, your payment is instantly verified and your order history will be updated. You can also pay at the counter using Cash or UPI.
                    </p>
                  </div>
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
