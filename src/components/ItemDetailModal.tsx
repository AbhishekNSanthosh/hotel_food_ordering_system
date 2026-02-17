'use client';

import { MenuItem } from '@/types';
import { useState, useEffect } from 'react';

interface ItemDetailModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MenuItem, quantity: number) => void;
}

export default function ItemDetailModal({ item, isOpen, onClose, onAddToCart }: ItemDetailModalProps) {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 text-white hover:bg-black/20 transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="aspect-video w-full overflow-hidden bg-muted">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
                            <div className="flex gap-2 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                                </span>
                                {item.spiceLevel && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                        {'🌶️'.repeat(item.spiceLevel === 'Mild' ? 1 : item.spiceLevel === 'Medium' ? 2 : 3)} {item.spiceLevel}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-2xl font-black text-[var(--deep-burgundy)]">${item.price.toFixed(2)}</span>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-sm">
                        {item.description}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
                            <div className="flex items-center gap-4 border-2 border-gray-100 rounded-xl p-1 w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subtotal</label>
                            <p className="text-2xl font-black text-[var(--deep-burgundy)]">${(item.price * quantity).toFixed(2)}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            onAddToCart(item, quantity);
                            onClose();
                        }}
                        className="w-full bg-gradient-to-r from-[var(--deep-burgundy)] to-[var(--muted-gold)] text-white py-4 rounded-xl font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    );
}
