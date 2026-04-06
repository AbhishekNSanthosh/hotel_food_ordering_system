"use client";

import { useEffect, useRef, useState } from "react";
import { CartItem } from "./CartSidebar";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string;
  customerName: string;
  notes: string;
  sessionId: string;
  onPaymentSuccess: (orderId: string) => void;
  onPaymentFailure: (error: string) => void;
}

type PaymentView = "select" | "processing" | "success" | "failed";

export default function PaymentModal({
  isOpen,
  onClose,
  cart,
  tableNumber,
  customerName,
  notes,
  sessionId,
  onPaymentSuccess,
  onPaymentFailure,
}: PaymentModalProps) {
  const [view, setView] = useState<PaymentView>("select");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrderId, setSuccessOrderId] = useState("");
  const scriptLoaded = useRef(false);

  const total = cart.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0,
  );

  // Load Razorpay script
  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setView("select");
      setErrorMsg("");
      setSuccessOrderId("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Step 1: Create Razorpay order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          notes,
          sessionId,
          items: cart.map((i) => ({
            menuItem: i.menuItem._id,
            name: i.menuItem.name,
            price: i.menuItem.price,
            quantity: i.quantity,
          })),
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create payment order");

      const { orderId, razorpayOrderId, amount, currency, keyId } = data;

      if (!keyId) {
        throw new Error("Razorpay Key ID is missing from server response. Please check your configuration.");
      }

      setIsLoading(false);
      setView("processing");

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "Hotel Food Ordering",
        description: `Table ${tableNumber} - ${cart.length} item(s)`,
        order_id: razorpayOrderId,
        prefill: {
          name: customerName || "Guest",
          contact: "",
          email: "",
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            setView("failed");
            setErrorMsg("Payment was cancelled. Please try again.");
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setSuccessOrderId(orderId);
              setView("success");
            } else {
              throw new Error(
                verifyData.error || "Payment verification failed",
              );
            }
          } catch (err: any) {
            setView("failed");
            setErrorMsg(err.message || "Payment verification failed.");
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK not loaded. Please check your connection.",
        );
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setView("failed");
        setErrorMsg(
          resp.error?.description || "Payment failed. Please try again.",
        );
      });
      rzp.open();
    } catch (err: any) {
      setIsLoading(false);
      setView("failed");
      setErrorMsg(err.message || "Something went wrong.");
    }
  };

  const handleCOD = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          customerNote: notes,
          sessionId,
          items: cart.map((i) => ({
            menuItem: i.menuItem._id,
            name: i.menuItem.name,
            price: i.menuItem.price,
            quantity: i.quantity,
          })),
          totalAmount: total,
          paymentMethod: "cod",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      setSuccessOrderId(data._id);
      setView("success");
    } catch (err: any) {
      setView("failed");
      setErrorMsg(err.message || "Failed to place order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    onPaymentSuccess(successOrderId);
    onClose();
  };

  const handleFailedClose = () => {
    onPaymentFailure(errorMsg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={view === "select" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl payment-modal-glass animate-in fade-in zoom-in-95 duration-300">
        {/* Gradient header bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        {/* ─── SELECT VIEW ─── */}
        {view === "select" && (
          <div className="bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Choose Payment
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Table {tableNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Order summary */}
            <div className="bg-muted/40 rounded-xl p-4 mb-6 border border-border">
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.menuItem._id as string}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.menuItem.name}{" "}
                      <span className="text-xs">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-foreground">
                      ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-orange-500">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment options */}
            <div className="space-y-3">
              {/* Razorpay */}
              <button
                onClick={handleRazorpayPayment}
                disabled={isLoading}
                id="btn-pay-razorpay"
                className="group w-full flex items-center gap-4 p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-foreground text-sm">
                    Pay Online
                  </div>
                  <div className="text-xs text-muted-foreground">
                    UPI · Cards · Wallets · Net Banking
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">
                    Instant
                  </span>
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </button>

              {/* COD */}
              <button
                onClick={handleCOD}
                disabled={isLoading}
                id="btn-pay-cod"
                className="group w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-muted-foreground/40 bg-muted/20 hover:bg-muted/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-foreground text-sm">
                    Pay at Counter
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cash on delivery at billing
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              Secured by Razorpay
            </p>
          </div>
        )}

        {/* ─── PROCESSING VIEW ─── */}
        {view === "processing" && (
          <div className="bg-card p-8 flex flex-col items-center justify-center gap-4 min-h-[260px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Awaiting Payment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please complete the payment in the Razorpay window
              </p>
            </div>
          </div>
        )}

        {/* ─── SUCCESS VIEW ─── */}
        {view === "success" && (
          <div className="bg-card p-8 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">
                Payment Successful!
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                Your order has been confirmed and sent to the kitchen. 🎉
              </p>
            </div>
            <div className="w-full bg-muted/40 rounded-xl p-4 border border-border text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-green-500">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Table</span>
                <span className="font-medium text-foreground">
                  {tableNumber}
                </span>
              </div>
            </div>
            <button
              onClick={handleSuccessClose}
              id="btn-payment-success-close"
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              Track My Order
            </button>
          </div>
        )}

        {/* ─── FAILED VIEW ─── */}
        {view === "failed" && (
          <div className="bg-card p-8 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">
                Payment Failed
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                {errorMsg || "Something went wrong. Please try again."}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => setView("select")}
                id="btn-payment-retry"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleFailedClose}
                className="w-full py-3 rounded-xl border border-border hover:bg-muted text-foreground font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
