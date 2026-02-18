import { MenuItem } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  onPlaceOrder: (customerName: string, notes: string) => void;
  isOrdering: boolean;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onPlaceOrder,
  isOrdering,
}: CartSidebarProps) {
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const total = cart.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0,
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-background animate-in slide-in-from-right duration-300 border-l border-border">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <h2 className="text-lg font-semibold text-foreground">Your Order</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Close panel</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <svg
                className="h-12 w-12 text-muted-foreground/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-muted-foreground">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Go back to menu
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.menuItem._id} className="flex py-2">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-foreground">
                        <h3>{item.menuItem.name}</h3>
                        <p className="ml-4 text-primary font-bold">
                          ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.menuItem.isVeg ? "Veg" : "Non-Veg"}
                      </p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center space-x-2 border border-border rounded-md">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.menuItem._id,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          className="px-2 py-1 hover:bg-accent hover:text-accent-foreground"
                        >
                          -
                        </button>
                        <span className="font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.menuItem._id,
                              item.quantity + 1,
                            )
                          }
                          className="px-2 py-1 hover:bg-accent hover:text-accent-foreground"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.menuItem._id)}
                        className="font-medium text-destructive hover:text-destructive/80"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border px-6 py-6 bg-muted/20">
            <div className="flex justify-between text-base font-medium text-foreground mb-4">
              <p>Subtotal</p>
              <p className="text-xl font-bold text-primary">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="customerName"
                  className="mt-1 block w-full rounded-md border-border bg-background text-foreground focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  placeholder="Allergies, special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => onPlaceOrder(customerName, notes)}
              disabled={isOrdering}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isOrdering ? "Placing Order..." : "Confirm Order"}
            </button>
            <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
              <p>
                or{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:text-primary/80"
                  onClick={onClose}
                >
                  Continue Ordering
                  <span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
