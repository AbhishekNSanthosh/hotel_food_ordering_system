
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import MenuCard from '@/components/MenuCard';
import CartSidebar, { CartItem } from '@/components/CartSidebar';
import ItemDetailModal from '@/components/ItemDetailModal';
import { MenuItem } from '@/types';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json() as MenuItem[];
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch menu', error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || 'Failed to seed');
      await fetchMenu();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to seed data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem._id === item._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity: quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((i) =>
        i.menuItem._id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItem._id !== itemId));
  };

  const placeOrder = async (customerName: string, notes: string) => {
    setOrdering(true);
    try {
      const orderData = {
        tableNumber,
        customerName,
        items: cart.map((i) => ({
          menuItem: i.menuItem._id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
          notes,
        })),
        totalAmount: cart.reduce((acc, i) => acc + i.menuItem.price * i.quantity, 0),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert('Order placed successfully!');
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert('Failed to place order.');
      }
    } catch (error) {
      console.error('Order error', error);
      alert('Error placing order.');
    } finally {
      setOrdering(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Header
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        tableNumber={tableNumber}
      />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-foreground mb-4">No menu items found</h2>
            <button
              onClick={seedData}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            >
              Load Sample Menu
            </button>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item._id as string}
                  item={item}
                  onAdd={addToCart}
                  onViewDetail={setSelectedItemForModal}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onPlaceOrder={placeOrder}
        isOrdering={ordering}
      />

      <ItemDetailModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Application...</div>}>
      <MenuContent />
    </Suspense>
  );
}
