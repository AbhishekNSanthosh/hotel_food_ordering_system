"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Menu Management State
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [menuFormData, setMenuFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    image: "",
    isAvailable: true,
    isVeg: true,
    spiceLevel: "Medium" as "Mild" | "Medium" | "Hot",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle image upload with progress
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      if (!API_KEY || API_KEY === "your_imgbb_api_key_here") {
        toast.error(
          "Please configure NEXT_PUBLIC_IMGBB_API_KEY in .env.local file. Get a free API key from https://api.imgbb.com/",
        );
        setUploadingImage(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.imgbb.com/1/upload?key=${API_KEY}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setMenuFormData((prev) => ({ ...prev, image: data.data.url }));
            toast.success("Image uploaded successfully!");
          } else {
            toast.error(
              "Upload failed: " + (data.error?.message || "Unknown error"),
            );
          }
        } else {
          toast.error("Upload failed with status " + xhr.status);
        }
        setUploadingImage(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        console.error("Image upload error");
        toast.error("Failed to upload image. Please try again.");
        setUploadingImage(false);
        setUploadProgress(0);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      setUploadingImage(false);
    }
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  useEffect(() => {
    if (activeSection === "menu") {
      fetchMenuItems();
    }
  }, [activeSection]);

  // Handle menu form submission
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicates
    if (!editingItem) {
      const duplicate = menuItems.find(
        (item) => item.name.toLowerCase() === menuFormData.name.toLowerCase(),
      );
      if (duplicate) {
        toast.error("A menu item with this name already exists!");
        return;
      }
    }

    try {
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? {
            ...menuFormData,
            _id: editingItem._id,
            price: parseFloat(menuFormData.price),
          }
        : { ...menuFormData, price: parseFloat(menuFormData.price) };

      const res = await fetch("/api/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchMenuItems();
        setShowMenuModal(false);
        resetMenuForm();
        toast.success(
          editingItem
            ? "Menu item updated successfully!"
            : "Menu item added successfully!",
        );
      } else {
        toast.error("Failed to save menu item");
      }
    } catch (error) {
      console.error("Menu save error:", error);
      toast.error("Error saving menu item");
    }
  };

  // Reset menu form
  const resetMenuForm = () => {
    setMenuFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      subCategory: "",
      image: "",
      isAvailable: true,
      isVeg: true,
      spiceLevel: "Medium",
    });
    setEditingItem(null);
    setImagePreview("");
  };

  // Edit menu item
  const handleEditMenuItem = (item: any) => {
    setEditingItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      subCategory: item.subCategory || "",
      image: item.image || "",
      isAvailable: item.isAvailable,
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel || "Medium",
    });
    setImagePreview(item.image || "");
    setShowMenuModal(true);
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMenuItems();
        toast.success("Menu item deleted successfully!");
      } else {
        toast.error("Failed to delete menu item");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting menu item");
    }
  };

  // Toggle availability
  const toggleAvailability = async (item: any) => {
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
      });

      if (res.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
    }
  };

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "orders", name: "Orders", icon: "🛒", badge: orders.length },
    { id: "menu", name: "Menu Management", icon: "🍽️" },
    { id: "kitchen", name: "Kitchen", icon: "👨‍🍳" },
    { id: "billing", name: "Billing", icon: "💳" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  // Get unique table numbers from orders
  const uniqueTables = Array.from(
    new Set(orders.map((order) => order.tableNumber)),
  ).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });

  // Filter orders based on selected table
  const filteredOrders =
    selectedTable === "all"
      ? orders
      : orders.filter((order) => order.tableNumber === selectedTable);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col`}
        style={{ minHeight: "100vh" }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Restaurant Management
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Toggle sidebar"
            >
              <span className="text-lg">{sidebarOpen ? "◀" : "▶"}</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`${activeSection === item.id ? "bg-background text-foreground" : "bg-primary text-primary-foreground"} text-xs font-bold px-2 py-0.5 rounded-full`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-border">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {navigationItems.find((item) => item.id === activeSection)
                    ?.name || "Dashboard"}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Administrator
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  A
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Table Selector */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Filter by Table
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      View orders for specific tables
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Table:
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-0 text-sm font-medium transition-all"
                    >
                      <option value="all">All Tables</option>
                      {uniqueTables.map((table) => (
                        <option key={table} value={table}>
                          Table #{table}
                        </option>
                      ))}
                    </select>
                    {selectedTable !== "all" && (
                      <button
                        onClick={() => setSelectedTable("all")}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-foreground text-sm font-medium transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        Total Orders
                      </p>
                      <p className="text-3xl font-black text-primary mt-1">
                        {filteredOrders.length}
                      </p>
                      {selectedTable !== "all" && (
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Table #{selectedTable}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                      📦
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        Active Orders
                      </p>
                      <p className="text-3xl font-black text-orange-600 mt-1">
                        {
                          filteredOrders.filter(
                            (o) =>
                              !["Delivered", "Cancelled"].includes(o.status),
                          ).length
                        }
                      </p>
                      {selectedTable !== "all" && (
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Table #{selectedTable}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-2xl">
                      🔥
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        {selectedTable === "all"
                          ? "Revenue Today"
                          : "Table Revenue"}
                      </p>
                      <p className="text-3xl font-black text-green-700 mt-1">
                        ₹
                        {filteredOrders
                          .reduce((sum, o) => sum + o.totalAmount, 0)
                          .toFixed(2)}
                      </p>
                      {selectedTable !== "all" && (
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Table #{selectedTable}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl">
                      💰
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        Avg Order Value
                      </p>
                      <p className="text-3xl font-black text-primary mt-1">
                        ₹
                        {filteredOrders.length > 0
                          ? (
                              filteredOrders.reduce(
                                (sum, o) => sum + o.totalAmount,
                                0,
                              ) / filteredOrders.length
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                      {selectedTable !== "all" && (
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Table #{selectedTable}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-2xl">
                      📊
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  {selectedTable === "all"
                    ? "Recent Orders"
                    : `Orders for Table #${selectedTable}`}
                </h2>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-500 text-sm">
                      {selectedTable === "all"
                        ? "No active orders found."
                        : `No orders found for Table #${selectedTable}.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                      >
                        <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-b border-border">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Table #{order.tableNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : order.status === "Preparing"
                                    ? "bg-orange-100 text-orange-800"
                                    : order.status === "Ready"
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="px-4 py-3">
                          {order.customerName && (
                            <p className="text-xs text-gray-600 mb-2">
                              <span className="font-medium text-gray-900">
                                {order.customerName}
                              </span>
                            </p>
                          )}
                          <div className="border-t border-b border-border py-2 my-2 space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-700">
                                  <span className="font-semibold">
                                    {item.quantity}×
                                  </span>{" "}
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between font-semibold text-gray-900 mt-2 text-sm">
                            <span>Total:</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-muted/30 px-4 py-3 border-t border-border">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(order._id, e.target.value)
                            }
                            className="block w-full rounded-lg border border-border py-2 px-3 text-xs font-semibold focus:border-primary focus:outline-none transition-all cursor-pointer bg-background"
                          >
                            <option value="Pending">🕒 Pending</option>
                            <option value="Confirmed">✅ Confirmed</option>
                            <option value="Preparing">👨‍🍳 Preparing</option>
                            <option value="Ready">🛎️ Ready</option>
                            <option value="Delivered">🚚 Delivered</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "menu" && (
            <div className="space-y-4">
              {/* Menu Header */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Menu Management
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Add, edit, delete, and manage menu items
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetMenuForm();
                      setShowMenuModal(true);
                    }}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all text-sm"
                  >
                    + Add New Dish
                  </button>
                </div>
              </div>

              {/* Menu Items Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🍽️</div>
                    <p className="text-gray-500 text-sm">
                      No menu items found. Add your first dish!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Spice
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {menuItems.map((item) => (
                          <tr
                            key={item._id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {item.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-primary">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.isVeg
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.isVeg ? "🥬 Veg" : "🍖 Non-Veg"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700">
                                {item.spiceLevel || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleAvailability(item)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                  item.isAvailable
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                              >
                                {item.isAvailable
                                  ? "✓ Available"
                                  : "✗ Unavailable"}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditMenuItem(item)}
                                  className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteMenuItem(item._id)}
                                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Order Management
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track and update all restaurant orders
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchOrders}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Refresh"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Table
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 text-xs font-mono text-gray-500">
                            #{order._id.slice(-6)}
                          </td>
                          <td className="px-4 py-4 font-bold text-gray-900">
                            Table {order.tableNumber}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {order.customerName || "Guest"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-gray-600 max-w-xs truncate">
                              {order.items
                                .map((i) => `${i.quantity}x ${i.name}`)
                                .join(", ")}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-[var(--deep-burgundy)]">
                            ₹{order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateStatus(order._id, e.target.value)
                              }
                              className={`text-xs font-bold px-2 py-1 rounded border-2 transition-all cursor-pointer outline-none ${
                                order.status === "Delivered"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : order.status === "Cancelled"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-orange-200 bg-orange-50 text-orange-700"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Ready">Ready</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection !== "dashboard" &&
            activeSection !== "menu" &&
            activeSection !== "orders" && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">
                  {
                    navigationItems.find((item) => item.id === activeSection)
                      ?.icon
                  }
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {
                    navigationItems.find((item) => item.id === activeSection)
                      ?.name
                  }
                </h2>
                <p className="text-gray-500">
                  This section is under development.
                </p>
              </div>
            )}
        </main>
      </div>

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingItem ? "✏️ Edit Menu Item" : "➕ Add New Menu Item"}
              </h3>
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  resetMenuForm();
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMenuSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={menuFormData.name}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                    placeholder="e.g., Butter Chicken"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={menuFormData.description}
                    onChange={(e) =>
                      setMenuFormData({
                        ...menuFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                    rows={3}
                    placeholder="Describe the dish..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={menuFormData.price}
                    onChange={(e) =>
                      setMenuFormData({
                        ...menuFormData,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={menuFormData.category}
                    onChange={(e) =>
                      setMenuFormData({
                        ...menuFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Breads">Breads</option>
                    <option value="Rice">Rice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Sub Category
                  </label>
                  <input
                    type="text"
                    value={menuFormData.subCategory}
                    onChange={(e) =>
                      setMenuFormData({
                        ...menuFormData,
                        subCategory: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                    placeholder="e.g., Curry, Soup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Spice Level
                  </label>
                  <select
                    value={menuFormData.spiceLevel}
                    onChange={(e) =>
                      setMenuFormData({
                        ...menuFormData,
                        spiceLevel: e.target.value as "Mild" | "Medium" | "Hot",
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="Mild">🌶️ Mild</option>
                    <option value="Medium">🌶️🌶️ Medium</option>
                    <option value="Hot">🌶️🌶️🌶️ Hot</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div className="mt-2 w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-primary">
                              Uploading...
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              {uploadProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Upload from your device
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-center text-gray-400 my-2">
                      -- OR --
                    </p>
                    <input
                      type="url"
                      value={menuFormData.image}
                      onChange={(e) =>
                        setMenuFormData({
                          ...menuFormData,
                          image: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                      placeholder="Paste image URL here"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuFormData.isVeg}
                      onChange={(e) =>
                        setMenuFormData({
                          ...menuFormData,
                          isVeg: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      🥬 Vegetarian
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuFormData.isAvailable}
                      onChange={(e) =>
                        setMenuFormData({
                          ...menuFormData,
                          isAvailable: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      ✓ Available
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {editingItem ? "💾 Update Item" : "➕ Add Item"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuModal(false);
                    resetMenuForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
