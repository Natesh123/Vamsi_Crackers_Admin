"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { io } from "socket.io-client";
import FireworksCanvas from "../components/FireworksCanvas";
import LoginTransition from "../components/LoginTransition";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount?: number;
  image: string;
  categoryId: number;
  category?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function AdminDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "orders" | "customers" | "reports" | "billing" | "contacts">("overview");
  const [contacts, setContacts] = useState<any[]>([]);
  const [unreadContacts, setUnreadContacts] = useState<any[]>([]);
  const [contactsSearch, setContactsSearch] = useState("");
  const [contactsPage, setContactsPage] = useState(1);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState<"date" | "month" | "year">("date");
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [orderFilterSource, setOrderFilterSource] = useState<"All" | "Website" | "POS">("All");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => orderFilterSource === "All" || (o.source || 'Website') === orderFilterSource);
  }, [orders, orderFilterSource]);

  // Notification States
  const [unreadOrders, setUnreadOrders] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      if (alarmTimeoutRef.current) clearInterval(alarmTimeoutRef.current);
      
      let count = 0;
      // Play immediately
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio error:", e));
      count++;

      // Play repeatedly every 1.5 seconds for 30 seconds (20 times)
      alarmTimeoutRef.current = setInterval(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error("Audio error:", e));
        }
        count++;
        if (count >= 20) {
          if (alarmTimeoutRef.current) clearInterval(alarmTimeoutRef.current);
        }
      }, 1500);
    }
  }, []);

  const stopAlarm = useCallback(() => {
    if (alarmTimeoutRef.current) clearInterval(alarmTimeoutRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Initialize root font size scale and socket
  useEffect(() => {
    document.documentElement.style.fontSize = "17.2px";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  useEffect(() => {
    const socket = io(apiUrl || "http://localhost:5000");
    
    socket.on("new-order", (order) => {
      setOrders(prev => [order, ...prev]);
      setUnreadOrders(prev => [order, ...prev]);
      playAlarm();
      showToast("New Order Received!", "success");
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, playAlarm]);

  // 5-minute recurring alarm if there are unread orders
  useEffect(() => {
    if (unreadOrders.length === 0) return;

    const interval = setInterval(() => {
      console.log("Playing 5-minute recurring alarm...");
      playAlarm();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [unreadOrders.length, playAlarm]);

  const handleMarkNotificationsAsRead = async () => {
    try {
      await fetch(`${apiUrl}/api/orders/mark-read`, { method: "PUT" });
      setUnreadOrders([]);
      setIsNotificationOpen(false);
      stopAlarm();
    } catch (e) {
      console.error("Failed to mark notifications as read", e);
    }
  };

  const handleMarkSingleNotificationAsRead = async (id: number) => {
    try {
      await fetch(`${apiUrl}/api/orders/${id}/mark-read`, { method: "PUT" });
      setUnreadOrders(prev => prev.filter(order => order.id !== id));
      if (unreadOrders.length <= 1) {
        setIsNotificationOpen(false);
      }
      stopAlarm();
    } catch (e) {
      console.error("Failed to mark single notification as read", e);
    }
  };

  const uniqueCustomers = useMemo(() => {
    const customerMap = new Map();
    orders.forEach(order => {
      const phone = order.customerPhone || order.customer_phone;
      const name = order.customerName || order.customer_name;
      const key = phone || name || "Walk-in";
      
      if (!key || key === "Walk-in") return;

      const orderDate = order.createdAt || order.created_at;
      const orderAmount = order.totalAmount || order.total_amount || 0;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          key: key,
          name: name || "Unknown",
          phone: phone || "No Phone",
          totalSpent: 0,
          orderCount: 0,
          lastOrderDate: orderDate
        });
      }

      const customer = customerMap.get(key);
      customer.totalSpent += parseFloat(orderAmount);
      customer.orderCount += 1;
      
      if (new Date(orderDate) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = orderDate;
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Reports Aggregation
  const salesReports = useMemo(() => {
    const daily: Record<string, { orders: number; revenue: number; ts: number }> = {};
    const monthly: Record<string, { orders: number; revenue: number; ts: number }> = {};
    const yearly: Record<string, { orders: number; revenue: number; ts: number }> = {};

    const filteredOrders = orders.filter(order => {
      const dateStr = order.created_at || order.createdAt;
      if (!dateStr) return false;
      const orderTime = new Date(dateStr).getTime();
      
      let isValid = true;
      if (reportFromDate) {
        const fromTime = new Date(`${reportFromDate}T00:00:00`).getTime();
        if (orderTime < fromTime) isValid = false;
      }
      if (reportToDate) {
        const toTime = new Date(`${reportToDate}T23:59:59`).getTime();
        if (orderTime > toTime) isValid = false;
      }
      return isValid;
    });

    filteredOrders.forEach(order => {
      const dateStr = order.created_at || order.createdAt;
      if (!dateStr) return;
      
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return;
      
      const day = String(dateObj.getDate()).padStart(2, '0');
      const monthStr = dateObj.toLocaleDateString("en-US", { month: "short" });
      const year = dateObj.getFullYear();
      
      const dayKey = `${day}-${monthStr}-${year}`;
      const monthKey = `${monthStr}-${year}`;
      const yearKey = `${year}`;
      
      const amount = parseFloat(order.totalAmount || order.total_amount) || 0;

      if (!daily[dayKey]) daily[dayKey] = { orders: 0, revenue: 0, ts: new Date(year, dateObj.getMonth(), dateObj.getDate()).getTime() };
      daily[dayKey].orders += 1;
      daily[dayKey].revenue += amount;

      if (!monthly[monthKey]) monthly[monthKey] = { orders: 0, revenue: 0, ts: new Date(year, dateObj.getMonth(), 1).getTime() };
      monthly[monthKey].orders += 1;
      monthly[monthKey].revenue += amount;

      if (!yearly[yearKey]) yearly[yearKey] = { orders: 0, revenue: 0, ts: new Date(year, 0, 1).getTime() };
      yearly[yearKey].orders += 1;
      yearly[yearKey].revenue += amount;
    });

    const toArray = (obj: Record<string, { orders: number; revenue: number; ts: number }>) => {
      return Object.entries(obj).map(([key, value]) => ({
        key,
        ...value
      })).sort((a, b) => b.ts - a.ts);
    };

    return {
      date: toArray(daily),
      month: toArray(monthly),
      year: toArray(yearly),
    };
  }, [orders, reportFromDate, reportToDate]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: number, name: string} | null>(null);
  const [productToDelete, setProductToDelete] = useState<{id: number, name: string} | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<{name: string, key: string} | null>(null);

  // Pagination states
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const itemsPerPage = 8;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("admin");
  const [passwordInput, setPasswordInput] = useState("admin123");
  const [loginError, setLoginError] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search & Filter
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("All");

  // Reports Filter
  const [reportMonth, setReportMonth] = useState<string>("All");
  const [reportYear, setReportYear] = useState<string>("All");

  // POS Billing State
  const [billingCart, setBillingCart] = useState<any[]>([]);
  const [billingCustomer, setBillingCustomer] = useState({ name: "", phone: "", email: "", city: "", address: "" });
  const [billingSearch, setBillingSearch] = useState("");
  const [billingCategoryFilter, setBillingCategoryFilter] = useState("All");
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<Toast | null>(null);

  // Category Forms state
  const [newCategoryName, setNewCategoryName] = useState("");

  // Global Discount state
  const [showGlobalDiscountModal, setShowGlobalDiscountModal] = useState(false);
  const [globalDiscountValue, setGlobalDiscountValue] = useState("50");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Product Modal/Form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOriginalPrice, setProductOriginalPrice] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productApplyDiscount, setProductApplyDiscount] = useState(true);
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productImage, setProductImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Price List PDF Manager states
  const [priceListUrl, setPriceListUrl] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Translation helpers and states
  const [productTamilTranslation, setProductTamilTranslation] = useState("");
  const [isTranslatingProduct, setIsTranslatingProduct] = useState(false);
  const [newCatTamilTranslation, setNewCatTamilTranslation] = useState("");
  const [isTranslatingNewCat, setIsTranslatingNewCat] = useState(false);
  const [editCatTamilTranslation, setEditCatTamilTranslation] = useState("");
  const [isTranslatingEditCat, setIsTranslatingEditCat] = useState(false);

  const translateText = async (text: string): Promise<string> => {
    if (!text || !text.trim()) return "";
    // If it already has Tamil characters, skip
    if (/[\u0b80-\u0bff]/.test(text)) return "";
    
    // Strip existing parentheses if any
    const cleanText = text.replace(/\s*\(.*\)\s*/g, "").trim();
    if (!cleanText) return "";

    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(cleanText)}`);
      if (!res.ok) return "";
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
    } catch (e) {
      console.error(e);
    }
    return "";
  };

  const appendTamilTranslation = (currentVal: string, translated: string, setter: (val: string) => void) => {
    if (!translated) return;
    const cleanBase = currentVal.replace(/\s*\(.*\)\s*/g, "").trim();
    setter(`${cleanBase} (${translated})`);
  };

  // Product Name Translation Effect
  useEffect(() => {
    if (!productName.trim()) {
      setProductTamilTranslation("");
      return;
    }
    if (productName.includes("(") && /[\u0b80-\u0bff]/.test(productName)) return;

    const delayDebounce = setTimeout(async () => {
      setIsTranslatingProduct(true);
      const translated = await translateText(productName);
      setProductTamilTranslation(translated);
      setIsTranslatingProduct(false);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [productName]);

  // New Category Translation Effect
  useEffect(() => {
    if (!newCategoryName.trim()) {
      setNewCatTamilTranslation("");
      return;
    }
    if (newCategoryName.includes("(") && /[\u0b80-\u0bff]/.test(newCategoryName)) return;

    const delayDebounce = setTimeout(async () => {
      setIsTranslatingNewCat(true);
      const translated = await translateText(newCategoryName);
      setNewCatTamilTranslation(translated);
      setIsTranslatingNewCat(false);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [newCategoryName]);

  // Edit Category Translation Effect
  useEffect(() => {
    if (!editCategoryName.trim()) {
      setEditCatTamilTranslation("");
      return;
    }
    if (editCategoryName.includes("(") && /[\u0b80-\u0bff]/.test(editCategoryName)) return;

    const delayDebounce = setTimeout(async () => {
      setIsTranslatingEditCat(true);
      const translated = await translateText(editCategoryName);
      setEditCatTamilTranslation(translated);
      setIsTranslatingEditCat(false);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [editCategoryName]);

  // Preset images helper
  const presetImages = [
    { label: "Sparklers", path: "/assets/images/products/sparklers.png" },
    { label: "Flower Pots", path: "/assets/images/products/flower_pots.png" },
    { label: "Ground Chakkars", path: "/assets/images/products/ground_chakkars.png" },
    { label: "Rockets", path: "/assets/images/products/rockets.png" },
    { label: "Sky Shots", path: "/assets/images/products/sky_shots.png" },
    { label: "Garlands", path: "/assets/images/products/garlands.png" }
  ];

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, prodsRes, diagRes, plRes, ordersRes, contactsRes] = await Promise.all([
        fetch(`${apiUrl}/api/categories`),
        fetch(`${apiUrl}/api/products`),
        fetch(`${apiUrl}/api/diagnostics`).catch(() => null),
        fetch(`${apiUrl}/api/settings/price-list`).catch(() => null),
        fetch(`${apiUrl}/api/orders`).catch(() => null),
        fetch(`${apiUrl}/api/contacts`).catch(() => null),
      ]);

      if (!catsRes.ok || !prodsRes.ok) throw new Error("Failed to fetch data");

      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();

      setCategories(catsData);
      setProducts(prodsData);

      if (diagRes && diagRes.ok) {
        const diagData = await diagRes.json();
        setDiagnostics(diagData);
      }

      if (plRes && plRes.ok) {
        const plData = await plRes.json();
        setPriceListUrl(plData.url || "");
      }

      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
        setUnreadOrders(ordersData.filter((o: any) => o.is_read === 0 && o.source === 'Website'));
      }

      if (contactsRes && contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
        setUnreadContacts(contactsData.filter((c: any) => c.is_read === 0));
      }
    } catch (err: any) {
      showToast(err.message || "Error loading dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete === null) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/orders/${orderToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast("Order deleted successfully", "success");
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete order", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete order", "error");
    } finally {
      setOrderToDelete(null);
    }
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete === null) return;
    
    try {
      const customerOrders = orders.filter(order => {
        const phone = order.customerPhone || order.customer_phone;
        const name = order.customerName || order.customer_name;
        const key = phone || name || "Walk-in";
        return key === customerToDelete.key;
      });

      if (customerOrders.length === 0) {
        showToast("No orders found for this customer", "error");
        setCustomerToDelete(null);
        return;
      }

      const deletePromises = customerOrders.map(order => 
        fetch(`${apiUrl}/api/orders/${order.id}`, { method: 'DELETE' })
      );
      
      const results = await Promise.all(deletePromises);
      const allSuccess = results.every(res => res.ok);

      if (allSuccess) {
        showToast("Customer and all associated orders deleted successfully", "success");
        fetchData();
      } else {
        showToast("Failed to fully delete customer data", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete customer", "error");
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleDeleteContact = (contactId: number) => {
    setContactToDelete(contactId);
  };

  const confirmDeleteContact = async () => {
    if (contactToDelete === null) return;
    try {
      const res = await fetch(`${apiUrl}/api/contacts/${contactToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete contact message");
      setContacts(prev => prev.filter(c => c.id !== contactToDelete));
      setUnreadContacts(prev => prev.filter(c => c.id !== contactToDelete));
      showToast("Message deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setContactToDelete(null);
    }
  };

  const handleMarkContactRead = async (contactId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/contacts/${contactId}/mark-read`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark read");
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, is_read: 1 } : c));
      setUnreadContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleMarkAllContactsRead = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/contacts/mark-read`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark all read");
      setContacts(prev => prev.map(c => ({ ...c, is_read: 1 })));
      setUnreadContacts([]);
      showToast("All messages marked as read", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast("Order status updated", "success");
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };


  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      showToast("Only PDF files are allowed", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPdf(true);
    try {
      const res = await fetch(`${apiUrl}/api/settings/price-list/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload PDF");

      setPriceListUrl(data.url);
      showToast("Price list PDF uploaded successfully!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeletePriceList = async () => {
    if (!confirm("Are you sure you want to delete the price list PDF?")) return;

    try {
      const res = await fetch(`${apiUrl}/api/settings/price-list`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete price list");

      setPriceListUrl("");
      showToast("Price list PDF deleted successfully!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Check auth status on load
  useEffect(() => {
    setIsMounted(true);
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Reset previous errors
    setUsernameError("");
    setPasswordError("");

    if (!usernameInput.trim()) {
      setUsernameError("Username is required");
      hasError = true;
    } else if (usernameInput.trim() !== "admin") {
      setUsernameError("Invalid admin username");
      hasError = true;
    }

    if (!passwordInput) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (passwordInput !== "admin123") {
      setPasswordError("Incorrect account password");
      hasError = true;
    }

    if (hasError) {
      setLoginError(true);
      showToast("Please fix the validation errors below.", "error");
      return;
    }

    setIsLoggingIn(true);
    // Render the Dashboard under the transition screen early (at 1100ms) to load all categories/products
    setTimeout(() => {
      localStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
    }, 1100);

    // Fade out and unmount the transition curtain once the dashboard data is ready
    setTimeout(() => {
      setIsLoggingIn(false);
      showToast("Welcome back, Administrator!", "success");
    }, 2450);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    setUsernameInput("admin");
    setPasswordInput("admin123");
    setUsernameError("");
    setPasswordError("");
    showToast("Logged out successfully.", "success");
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBase = newCategoryName.replace(/\s*\(.*\)\s*/g, "").trim();
    const finalName = newCatTamilTranslation ? `${cleanBase} (${newCatTamilTranslation})` : cleanBase;
    if (!finalName) return;

    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
      setNewCatTamilTranslation("");
      document.getElementById("add-category-modal")?.classList.add("hidden");
      showToast("Category added successfully!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const cleanBase = editCategoryName.replace(/\s*\(.*\)\s*/g, "").trim();
    const finalName = editCatTamilTranslation ? `${cleanBase} (${editCatTamilTranslation})` : cleanBase;
    if (!finalName) return;

    try {
      const res = await fetch(`${apiUrl}/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category");

      setCategories((prev) =>
        prev
          .map((cat) => (cat.id === editingCategory.id ? data : cat))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCatTamilTranslation("");
      document.getElementById("add-category-modal")?.classList.add("hidden");
      showToast("Category updated successfully!", "success");
      fetchData(); // Refresh products to update category names
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id, name } = categoryToDelete;

    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setProducts((prev) => prev.filter((prod) => prod.categoryId !== id));
      showToast("Category and its products deleted!", "success");
      setCategoryToDelete(null);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Product Actions
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductName("");
    setProductPrice("");
    setProductOriginalPrice("");
    setProductDiscount("");
    setProductApplyDiscount(true);
    setProductTamilTranslation("");
    setProductCategoryId(categories[0]?.id.toString() || "");
    setProductImage(presetImages[0].path);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    // If product name already contains translation suffix, extract translated text
    const match = product.name.match(/\(([\u0b80-\u0bff\s]+)\)/);
    if (match) {
      setProductTamilTranslation(match[1].trim());
    } else {
      setProductTamilTranslation("");
    }
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductOriginalPrice(product.originalPrice.toString());
    setProductDiscount(product.discount !== undefined ? product.discount.toString() : "");
    setProductApplyDiscount(product.apply_discount !== undefined ? product.apply_discount : true);
    setProductCategoryId(product.categoryId.toString());
    setProductImage(product.image);
    setIsProductModalOpen(true);
  };

  const handleOriginalPriceChange = (val: string) => {
    setProductOriginalPrice(val);
    const orig = parseFloat(val);
    const offer = parseFloat(productPrice);
    if (!isNaN(orig) && orig > 0 && !isNaN(offer)) {
      const calculatedDisc = Math.round(((orig - offer) / orig) * 100);
      setProductDiscount(calculatedDisc >= 0 && calculatedDisc <= 100 ? calculatedDisc.toString() : "0");
    }
  };

  const handleOfferPriceChange = (val: string) => {
    setProductPrice(val);
    const orig = parseFloat(productOriginalPrice);
    const offer = parseFloat(val);
    if (!isNaN(orig) && orig > 0 && !isNaN(offer)) {
      const calculatedDisc = Math.round(((orig - offer) / orig) * 100);
      setProductDiscount(calculatedDisc >= 0 && calculatedDisc <= 100 ? calculatedDisc.toString() : "0");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProductImage(data.url);
      showToast("Image uploaded successfully!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice || !productOriginalPrice || !productCategoryId || !productImage) {
      showToast("Please fill all fields", "error");
      return;
    }

    const cleanBase = productName.replace(/\s*\(.*\)\s*/g, "").trim();
    const finalProductName = productTamilTranslation ? `${cleanBase} (${productTamilTranslation})` : cleanBase;

    const finalDiscount = parseFloat(productDiscount) || 0;
    const hasDiscount = finalDiscount > 0;

    const payload = {
      name: finalProductName,
      price: parseFloat(productPrice),
      originalPrice: parseFloat(productOriginalPrice),
      discount: finalDiscount,
      applyDiscount: hasDiscount,
      image: productImage,
      categoryId: parseInt(productCategoryId),
    };

    try {
      const url = editingProduct ? `${apiUrl}/api/products/${editingProduct.id}` : `${apiUrl}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data : p)));
        showToast("Product updated successfully!", "success");
      } else {
        setProducts((prev) => [data, ...prev]);
        showToast("Product added successfully!", "success");
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;

    try {
      const res = await fetch(`${apiUrl}/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted successfully!", "success");
      setProductToDelete(null);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Stats calculation
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const avgPrice = totalProducts
    ? Math.round(products.reduce((acc, curr) => acc + curr.price, 0) / totalProducts)
    : 0;
  const maxPriceProduct = products.length
    ? [...products].sort((a, b) => b.price - a.price)[0]
    : null;

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productFilter === "All" || prod.category === productFilter;
    return matchesSearch && matchesCategory;
  });

  const handlePrintSalesReport = (filteredOrders: any[], month: string, year: string, totalRev: number, totalDisc: number, avgOrder: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print report", "error");
      return;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const reportPeriod = `${month === "All" ? "All Months" : monthNames[parseInt(month)]} ${year === "All" ? "All Years" : year}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report - ${reportPeriod}</title>
          <style>
            @page { margin: 0; }
            body { font-family: 'Arial', sans-serif; padding: 10mm; color: #000; line-height: 1.4; max-width: 210mm; margin: 0 auto; font-size: 12px; }
            .header-title { text-align: center; font-weight: bold; text-decoration: underline; font-size: 18px; margin-bottom: 5px; text-transform: ; letter-spacing: 1px; }
            .header-subtitle { text-align: center; font-size: 14px; margin-bottom: 25px; color: #444; }
            .summary-box { border: 1px solid #000; padding: 15px; margin-bottom: 25px; display: flex; justify-content: space-around; background-color: #f8fafc; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 11px; font-weight: bold; text-transform: ; color: #555; }
            .summary-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #000; }
            th, td { border: 1px solid #000; padding: 6px 8px; }
            th { background-color: #cbd5e1; font-weight: bold; text-align: center; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .computer-generated { text-align: center; font-style: italic; font-size: 10px; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header-title">CRACKERS CITY - SALES REPORT</div>
          <div class="header-subtitle">Period: ${reportPeriod}</div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-value">Rs. ${totalRev.toLocaleString('en-IN')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Savings Provided</div>
              <div class="summary-value">Rs. ${totalDisc.toLocaleString('en-IN')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Orders</div>
              <div class="summary-value">${filteredOrders.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Avg Order Value</div>
              <div class="summary-value">Rs. ${Number(avgOrder).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 15%;">Order ID</th>
                <th class="text-left">Customer Name</th>
                <th style="width: 20%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.length === 0 ? '<tr><td colspan="4" class="text-center" style="padding: 20px;">No sales recorded for this period.</td></tr>' : ''}
              ${[...filteredOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(sale => `
                <tr>
                  <td class="text-center">${new Date(sale.created_at).toLocaleDateString()}</td>
                  <td class="text-center">#${sale.id}</td>
                  <td>${sale.customer_name}</td>
                  <td class="text-right bold">Rs. ${sale.total_amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="computer-generated">This is a computer generated report</div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const handlePrintOrder = (order: any) => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print invoices", "error");
      return;
    }

    const totalAmount = Number(order.total_amount || 0);
    const totalSavings = Number(order.total_savings || 0);

    const numberToWords = (num: number): string => {
      const integerNum = Math.round(num);
      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
      if (integerNum === 0) return 'Zero Rupees Only';
      if (integerNum > 999999999) return '';
      const n = ('000000000' + integerNum).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += (n[1] !== '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
      str += (n[2] !== '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
      str += (n[3] !== '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
      str += (n[4] !== '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
      str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Rupees Only' : 'Rupees Only';
      return str.trim();
    };

    const discountedItems = order.items.filter((item: any) => Number(item.originalPrice) > Number(item.price));
    const netRateItems = order.items.filter((item: any) => Number(item.originalPrice) <= Number(item.price));

    const discountedTotalOriginal = discountedItems.reduce((acc: number, item: any) => acc + (Number(item.originalPrice) * Number(item.quantity)), 0);
    const discountedTotalOffer = discountedItems.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);
    const discountedSavings = discountedTotalOriginal - discountedTotalOffer;
    const netRateTotal = netRateItems.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);

    const grossTotal = discountedTotalOriginal + netRateTotal;
    const discountPercent = discountedTotalOriginal > 0 ? ((discountedSavings / discountedTotalOriginal) * 100).toFixed(2) : "0.00";
    
    const renderTable = (items: any[], title: string, isNetRate: boolean, showTitle: boolean) => {
      if (items.length === 0) return '';
      return `
        ${showTitle ? `<div style="margin-top: 15px; font-weight: bold; font-size: 14px;">${title}</div>` : `<div style="margin-top: 15px;"></div>`}
        <table style="${showTitle ? 'margin-top: 5px;' : 'margin-top: 0px;'}">
          <thead>
            <tr>
              <th style="width: 5%;">No.</th>
              <th class="text-left">Particulars</th>
              <th style="width: 8%;">Unit</th>
              <th style="width: 10%;">Rate</th>
              <th style="width: 8%;">Qty</th>
              <th style="width: 12%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any, idx: number) => `
              <tr>
                <td class="text-center bold">${idx + 1}</td>
                <td class="bold">${item.name}</td>
                <td class="text-center">BOX</td>
                <td class="text-right">${isNetRate ? Number(item.price).toFixed(2) : Number(item.originalPrice).toFixed(2)}</td>
                <td class="text-center">${Number(item.quantity).toFixed(2)}</td>
                <td class="text-right">${((isNetRate ? Number(item.price) : Number(item.originalPrice)) * Number(item.quantity)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    };

    const hasBothTables = discountedItems.length > 0 && netRateItems.length > 0;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice #${order.id}</title>
          <style>
            @page { margin: 0; }
            body { font-family: 'Arial', sans-serif; padding: 10mm; color: #000; line-height: 1.4; max-width: 210mm; margin: 0 auto; font-size: 12px; }
            .header-title { text-align: center; font-weight: bold; text-decoration: underline; font-size: 16px; margin-bottom: 20px; text-transform: ; letter-spacing: 1px; }
            .flex-between { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .bill-to p { margin: 2px 0; }
            .bill-to .title { margin-bottom: 5px; }
            .contact-no { margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid #000; }
            th, td { border: 1px solid #000; padding: 5px 6px; }
            th { background-color: #cbd5e1; font-weight: bold; text-align: center; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .footer-section { display: flex; margin-top: 30px; font-size: 12px; page-break-inside: avoid; }
            .words-section { flex: 1; padding-right: 20px; display: flex; flex-direction: column; justify-content: space-between; }
            .totals-section { width: 320px; }
            .totals-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
            .totals-table td { border: 1px solid #000; padding: 5px 6px; }
            .bg-gray { background-color: #f1f5f9; }
            .bg-dark-gray { background-color: #cbd5e1; font-weight: bold; font-size: 14px; }
            .computer-generated { text-align: center; font-style: italic; font-size: 10px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header-title">ESTIMATE QUOTATION</div>
          
          <div class="flex-between bold">
            <div class="bill-to">
              <div class="title">Bill To:</div>
              <p>Mr/Mrs. ${order.customer_name.toUpperCase()}</p>
              <p>${order.customer_city.toUpperCase()}, ${order.customer_address.toUpperCase()}.</p>
              <div class="contact-no">Contact No : ${order.customer_phone}</div>
            </div>
            <div class="text-right" style="line-height: 1.8;">
              <div>Quotation No. : ${order.id.toString().padStart(4, '0')}</div>
              <div>Quotation Date. : ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN').replace(/\//g, '-')}</div>
            </div>
          </div>

          ${renderTable(discountedItems, "Discountable Items", false, hasBothTables)}
          ${renderTable(netRateItems, "Net Rate Items (No Discount)", true, hasBothTables)}

          <div class="computer-generated">This is Computer Generated Invoice</div>

          <div class="footer-section">
            <div class="words-section">
              <div>
                <div style="font-style: italic; margin-bottom: 5px;">Amount in Words</div>
                <div class="bold italic">${numberToWords(totalAmount)}</div>
              </div>
            </div>
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="bold text-center" style="width: 50%;">Sub Total</td>
                  <td class="bold text-center" style="width: 20%;"></td>
                  <td class="text-right" style="width: 30%;">${grossTotal.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray">
                  <td class="bold text-center">Overall Discount</td>
                  <td class="bold text-center">${discountPercent} %</td>
                  <td class="text-right">${discountedSavings.toFixed(2)}</td>
                </tr>
                <tr>
                  <td class="bold text-center">Total</td>
                  <td class="text-center"></td>
                  <td class="text-right">${totalAmount.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray">
                  <td class="bold text-center">Other Charges</td>
                  <td class="bold text-center">0.00 %</td>
                  <td class="text-right">0.00</td>
                </tr>
                <tr>
                  <td class="bold text-center">RoundOff</td>
                  <td class="text-center"></td>
                  <td class="text-right">0.00</td>
                </tr>
                <tr class="bg-dark-gray">
                  <td colspan="2" class="text-center">BILL AMOUNT</td>
                  <td class="text-right">${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const openGlobalDiscountModal = () => {
    const currentDiscount = products && products.length > 0 && products[0].discount !== undefined 
      ? products[0].discount.toString() 
      : "50";
    setGlobalDiscountValue(currentDiscount);
    setShowGlobalDiscountModal(true);
  };

  const applyGlobalDiscount = async () => {
    const discount = parseInt(globalDiscountValue, 10);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      showToast("Please enter a valid percentage between 0 and 100", "error");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const res = await fetch(`${apiUrl}/api/products/global-discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercentage: discount }),
      });
      if (!res.ok) throw new Error("Failed to apply global discount");
      showToast(`Successfully applied ${discount}% discount to all products!`, "success");
      fetchData(); // refresh products
      setShowGlobalDiscountModal(false);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        {isLoggingIn && <LoginTransition />}
        <div 
          className="min-h-[100dvh] bg-slate-50 text-slate-900 font-['Outfit'] antialiased flex flex-col items-center justify-center"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(13, 4, 21, 0.75), rgba(13, 4, 21, 0.9)), url('/assets/images/admin_login_bg_v2.png')` 
        }}
      >
        {/* Dynamic Canvas Fireworks Animation */}
        {isMounted && <FireworksCanvas />}

        {/* Animated Rising Spark Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {isMounted && [...Array(30)].map((_, i) => {
            const size = Math.random() * 5 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 10;
            const duration = Math.random() * 8 + 6;
            const colorClass = i % 3 === 0 
              ? "bg-slate-900 shadow-[0_0_8px_#fdb931]" 
              : i % 3 === 1 
                ? "bg-purple-500 shadow-[0_0_8px_#a855f7]" 
                : "bg-amber-500 shadow-[0_0_8px_#f59e0b]";
            return (
              <div
                key={i}
                className={`absolute rounded-full opacity-60 animate-sparkle-up ${colorClass}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  bottom: `-20px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
              />
            );
          })}
        </div>

        {/* Ambient Glowing Orbs */}
        
        

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideDown border ${
              toast.type === "success"
                ? "bg-green-950 border-green-500 text-green-200"
                : "bg-red-950 border-red-500 text-red-200"
            }`}
          >
            <span className="text-xl">{toast.type === "success" ? "✓" : "✕"}</span>
            <span className="font-bold text-base tracking-wide">{toast.message}</span>
          </div>
        )}

        <div className="relative z-10 w-full max-w-4xl p-4 md:p-6">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] md:w-[80%] h-full md:h-[120%] bg-gradient-to-tr from-amber-400/10 via-purple-500/10 to-blue-500/10 blur-3xl pointer-events-none rounded-full"></div>
          
          <div className="relative flex flex-col md:flex-row backdrop-blur-[40px] bg-white/[0.03] border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden group">
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

            {/* Left Column: Branding */}
            <div className="w-full md:w-5/12 p-8 md:p-12 flex flex-col items-center justify-center text-center relative z-10 border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
              <div className="w-28 h-28 md:w-40 md:h-40 mb-6 md:mb-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-1.5 backdrop-blur-md shadow-2xl shadow-amber-400/20 border border-white/20">
                <img src="/assets/images/sri_dhakshina_logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-[1.25rem]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white tracking-tight leading-tight mb-2 drop-shadow-lg uppercase">
                Admin Panel
              </h1>
              <p className="text-[9px] md:text-[11px] font-black text-amber-400/80 tracking-[0.3em] uppercase mt-2">Sri Dhakshina Crackers</p>
            </div>

            {/* Right Column: Form */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative z-10">
              <div className="mb-8 hidden md:block">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">Secure Login</h2>
                <p className="text-xs font-bold text-white/40 mt-1">Enter your credentials to access the dashboard</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-white/50 uppercase ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        setUsernameError("");
                        setLoginError(false);
                      }}
                      placeholder="Enter admin username"
                      className={`w-full bg-black/20 border rounded-xl py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-white/30 focus:bg-black/40 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all outline-none ${
                        usernameError ? 'border-red-500' : 'border-white/10 hover:border-white/20'
                      }`}
                    />
                  </div>
                  {usernameError && <p className="text-red-400 text-[10px] font-bold tracking-wider mt-1.5 ml-1 animate-slideDown">{usernameError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-white/50 uppercase ml-1">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError("");
                        setLoginError(false);
                      }}
                      placeholder="Enter account password"
                      className={`w-full bg-black/20 border rounded-xl py-3.5 pl-12 pr-12 text-sm font-semibold text-white placeholder-white/30 focus:bg-black/40 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all outline-none ${
                        passwordError ? 'border-red-500' : 'border-white/10 hover:border-white/20'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors" title={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordError && <p className="text-red-400 text-[10px] font-bold tracking-wider mt-1.5 ml-1 animate-slideDown">{passwordError}</p>}
                </div>

                <button type="submit" className="w-full py-4 mt-6 bg-white text-black font-black text-sm tracking-[0.2em] uppercase rounded-xl hover:bg-amber-400 transition-colors duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  Access Dashboard
                </button>
              </form>

              {/* Demo access */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <p className="text-[9px] text-white/40 font-black tracking-widest uppercase">Demo Access</p>
                <p className="text-[11px] text-indigo-300 font-mono font-bold bg-black/20 px-4 py-1.5 rounded-lg border border-white/5">admin / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {isLoggingIn && <LoginTransition />}
      <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-['Outfit'] antialiased overflow-hidden relative">
        {/* Left Sidebar (Full Height, Responsive Drawer) */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a0514] text-white flex flex-col h-full shrink-0 border-r border-white/5 overflow-hidden z-40 print:hidden transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-20 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="p-5 flex items-center gap-3 border-b border-white/5 mb-4 bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="relative w-11 h-11 rounded-lg bg-white p-0.5 overflow-hidden shrink-0 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <img src="/assets/images/sri_dhakshina_logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-black text-white tracking-tight uppercase leading-tight">
                Sri Dhakshina
                <span className="block text-amber-400 text-sm mt-0.5">Crackers</span>
              </h1>
              <p className="text-[10.5px] font-black text-indigo-400 tracking-widest uppercase mt-0.5">Admin Portal</p>
            </div>
          </div>
          <div className="px-6 py-2 text-sm font-bold tracking-widest uppercase text-slate-500 mb-2 mt-2">
            Dashboards
          </div>
          <nav className="flex-1 px-4 space-y-4">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "categories", label: "Categories", icon: "🏷️" },
              { id: "products", label: "Products", icon: "🛍️" },
              { id: "orders", label: "Orders", icon: "🛒" },
              { id: "customers", label: "Customers", icon: "👥" },
              { id: "contacts", label: "Contact Us", icon: "✉️" },
              { id: "reports", label: "Sales Reports", icon: "📈" },
              { id: "billing", label: "POS Billing", icon: "🧾" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[17px] font-bold transition-all duration-200 ${
                  activeTab === tab.id ? "bg-slate-800 text-white shadow-md shadow-slate-900/50" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span className="text-xl opacity-80">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 mt-auto border-t border-slate-800 pb-8">
            <button
              onClick={() => { handleLogout(); setIsMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[17px] font-bold transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn" 
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-900">
          {/* Mobile Header Banner */}
          <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#0a0514] border-b border-white/5 shrink-0 relative z-30">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 text-white hover:text-indigo-400 focus:outline-none transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white p-0.5 overflow-hidden border border-amber-400/40">
                <img src="/assets/images/sri_dhakshina_logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-sm" />
              </div>
              <span className="font-black text-white text-xs uppercase tracking-wider">Sri Dhakshina</span>
            </div>
            <div className="w-8 h-8"></div> {/* spacer */}
          </div>

          {/* Audio Element for Notifications */}
          <audio ref={audioRef} preload="auto" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />

          {/* Toast Notification */}
          {toast && (
            <div
              className={`absolute top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slideDown border ${
                toast.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <span className="text-xl">{toast.type === "success" ? "✓" : "✕"}</span>
              <span className="font-bold text-base tracking-wide">{toast.message}</span>
            </div>
          )}

          {/* Header */}
          <header className="bg-slate-900 border-b border-slate-800 h-20 flex-shrink-0 flex justify-between items-center px-4 lg:px-8 z-10 print:hidden shadow-sm relative">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👋</span>
              <span className="text-xl font-bold text-white hidden sm:inline-block tracking-wide">Welcome back, Admin</span>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadOrders.length > 0 && (
                    <span className="absolute top-0 right-0 -mr-1 -mt-1 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[1.25rem] h-5 border-2 border-slate-900 shadow-sm">
                        {unreadOrders.length > 99 ? '99+' : unreadOrders.length}
                      </span>
                    </span>
                  )}
                </button>
                
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transform transition-all origin-top-right">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                      {unreadOrders.length > 0 && (
                        <button onClick={handleMarkNotificationsAsRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {unreadOrders.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                          <span className="text-3xl mb-2">🎉</span>
                          <p className="text-sm font-medium">You're all caught up!</p>
                        </div>
                      ) : (
                        unreadOrders.map(order => (
                          <div 
                            key={`notif-${order.id}`} 
                            onClick={() => handleMarkSingleNotificationAsRead(order.id)}
                            className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xl group-hover:bg-indigo-200 transition-colors">
                                🛍️
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">New Order #{order.id}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{order.customer_name || 'Customer'} • ₹{order.total_amount}</p>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 bg-slate-50 h-full overflow-y-auto p-4 lg:p-8 relative print:p-0 print:bg-white rounded-tl-3xl shadow-inner border-t border-l border-slate-200/50">
            {loading ? (
              <div className="h-full flex flex-col justify-center items-center gap-4 text-slate-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-base tracking-tight ">Loading Dashboard Data...</p>
              </div>
            ) : (
            <>
                            {/* TAB: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-slideDown">
                  {/* Premium Welcome Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          System Online
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">
                          Welcome back, Admin
                        </h2>
                        <p className="text-indigo-200 text-base max-w-xl leading-relaxed">
                          Here's what's happening with your store today. You have {orders.length} active orders and {products.length} products in your catalog.
                        </p>
                      </div>
                      
                      <div className="relative group flex items-center gap-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 px-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] hover:-translate-y-0.5 transition-all duration-500 cursor-default overflow-hidden">
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                        
                        <div className="text-right relative z-10">
                          <p className="text-[10px] font-black text-emerald-200/80 uppercase tracking-widest mb-0.5 group-hover:text-emerald-100 transition-colors duration-300">Total Revenue</p>
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-200 drop-shadow-md">₹{orders.reduce((a,c) => a + (parseFloat(c.totalAmount || c.total_amount) || 0), 0).toFixed(2)}</p>
                        </div>
                        
                        <div className="w-px h-10 bg-white/20 relative z-10"></div>
                        
                        <div className="text-right relative z-10">
                          <p className="text-[10px] font-black text-indigo-200/80 uppercase tracking-widest mb-0.5 group-hover:text-indigo-100 transition-colors duration-300">Total Orders</p>
                          <p className="text-2xl font-black text-white drop-shadow-md">{orders.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Header Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        label: "Total Products",
                        value: products.length,
                        icon: "📦",
                        color: "bg-indigo-500",
                        bg: "bg-indigo-50",
                        tab: "products"
                      },
                      {
                        label: "Total Categories",
                        value: categories.length,
                        icon: "🏷️",
                        color: "bg-emerald-500",
                        bg: "bg-emerald-50",
                        tab: "categories"
                      },
                      {
                        label: "Total Orders",
                        value: orders.length,
                        icon: "🛒",
                        color: "bg-amber-500",
                        bg: "bg-amber-50",
                        tab: "orders"
                      },
                      {
                        label: "Total Customers",
                        value: uniqueCustomers.length,
                        icon: "👥",
                        color: "bg-fuchsia-500",
                        bg: "bg-fuchsia-50",
                        tab: "customers"
                      },
                    ].map((stat, i) => (
                      <div key={i} onClick={() => setActiveTab(stat.tab)} className={`cursor-pointer rounded-3xl p-6 border border-white/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between ${stat.color}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-white/20 text-white transform group-hover:scale-110 transition-transform duration-300">
                            {stat.icon}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-5xl font-black text-white tracking-tighter mb-1">{stat.value}</h3>
                          <p className="text-white/90 font-bold text-lg tracking-tight">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Activity & Overview Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Category Share - Takes up 1 column */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between p-6 bg-indigo-50 border-b border-indigo-100">
                        <div>
                          <h3 className="text-lg font-black text-indigo-950 tracking-tight">Category Mix</h3>
                          <p className="text-sm text-indigo-700/70 mt-1 font-medium">Distribution of products</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-indigo-100">
                          📊
                        </div>
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col">
                      {categories.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10">
                          <span className="text-4xl mb-3">📁</span>
                          <p className="text-slate-500 text-base font-medium">No categories added</p>
                        </div>
                      ) : (
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          {categories.map((cat, idx) => {
                            const count = products.filter((p) => p.categoryId === cat.id).length;
                            const percentage = products.length ? Math.round((count / products.length) * 100) : 0;
                            const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                            const barColor = colors[idx % colors.length];
                            
                            return (
                              <div key={cat.id} className="space-y-2 group">
                                <div className="flex justify-between items-center text-base">
                                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                                  <span className="font-black text-slate-900">{count} <span className="text-slate-400 font-medium text-sm ml-1">({percentage}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`${barColor} h-full rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      </div>
                    </div>

                    {/* Quick Management - Takes up 2 columns */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between p-6 bg-indigo-50 border-b border-indigo-100">
                        <div>
                          <h3 className="text-lg font-black text-indigo-950 tracking-tight">Quick Actions</h3>
                          <p className="text-sm text-indigo-700/70 mt-1 font-medium">Frequently used tools</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-indigo-100">
                          ⚡
                        </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <button
                          onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setIsProductModalOpen(true); }}
                          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:-translate-y-1 transition-all group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                            📦
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Add New Product</h4>
                          <p className="text-sm text-slate-500 mt-1 text-center">Add to catalog instantly</p>
                        </button>
                        
                        <button
                          onClick={() => { setEditingCategory(null); setNewCategoryName(""); setNewCatTamilTranslation(""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }}
                          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-slate-900/5 hover:-translate-y-1 transition-all group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                            🏷️
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Create Category</h4>
                          <p className="text-sm text-slate-500 mt-1 text-center">Organize your products</p>
                        </button>
                      </div>

                      <div className="mt-auto bg-slate-900 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-slate-900/10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/10">
                            📄
                          </div>
                          <div>
                            <h4 className="font-bold text-white tracking-tight">Price List PDF</h4>
                            <p className="text-sm text-slate-400 mt-0.5">Manage your downloadable catalog</p>
                          </div>
                        </div>
                        {priceListUrl ? (
                          <div className="flex items-center gap-2">
                            <a href={priceListUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-slate-900 font-bold text-sm rounded-full hover:bg-slate-100 transition-colors shadow-sm">
                              View PDF
                            </a>
                            <button onClick={handleDeletePriceList} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors border border-red-500/20" title="Delete Price List">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="application/pdf"
                              onChange={handlePdfUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              disabled={uploadingPdf}
                            />
                            <button className={`px-5 py-2.5 ${uploadingPdf ? 'bg-slate-700 text-slate-400' : 'bg-indigo-500 hover:bg-indigo-600 text-white'} font-bold text-sm rounded-full transition-colors shadow-sm flex items-center gap-2`}>
                              {uploadingPdf ? 'Uploading...' : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  Upload PDF
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}

                            {/* TAB: CATEGORIES */}
              {activeTab === "categories" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Category List</h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium">Organize and manage your product groupings</p>
                    </div>
                    <button
                      onClick={() => { setEditingCategory(null); setNewCategoryName(""); setNewCatTamilTranslation(""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }}
                      className="mt-4 sm:mt-0 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base hover:-translate-y-1 hover:shadow-xl transition-all flex items-center gap-3 relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      <span className="text-emerald-500 font-black text-xl leading-none">➕</span> Add New Category
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length === 0 ? (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl">
                          <span className="text-6xl mb-4 opacity-50">📁</span>
                          <h3 className="text-xl font-bold text-slate-700">No categories yet</h3>
                          <p className="text-slate-500 mt-2 text-base">Create your first category to start organizing products.</p>
                       </div>
                    ) : (
                      categories.slice((categoriesPage - 1) * 6, categoriesPage * 6).map(cat => (
                        <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 group">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                              🏷️
                            </div>
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                               <button onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name.replace(/\\s*\\(.*\\)\\s*/g, "").trim()); const m = cat.name.match(/\\((.*?)\\)/); setEditCatTamilTranslation(m ? m[1] : ""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors" title="Edit">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                               </button>
                               <button onClick={() => setCategoryToDelete({id: cat.id, name: cat.name})} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors" title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                               </button>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{cat.name}</h4>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Inventory</span>
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-black text-sm rounded-full">
                                {products.filter(p => p.categoryId === cat.id).length} Items
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {categories.length > 6 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <button disabled={categoriesPage === 1} onClick={() => setCategoriesPage(p => p - 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                        </button>
                        <span className="px-4 font-bold text-slate-700">Page {categoriesPage} of {Math.ceil(categories.length / 6)}</span>
                        <button disabled={categoriesPage === Math.ceil(categories.length / 6)} onClick={() => setCategoriesPage(p => p + 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

                            {/* TAB: PRODUCTS */}
              {activeTab === "products" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Products List</h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium">Browse and manage {products.length} products</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative z-10">
                      <button
                        onClick={() => setShowGlobalDiscountModal(true)}
                        className="flex-1 lg:flex-none px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                      >
                        <span className="text-amber-400">🏷️</span> Global Discount
                      </button>
                      <button
                        onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setIsProductModalOpen(true); }}
                        className="flex-1 lg:flex-none px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base hover:-translate-y-1 hover:shadow-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      >
                        <span className="text-blue-600">➕</span> Add Product
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                      <input type="text" placeholder="Search by product name..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                    </div>
                    <div className="sm:w-64 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📁</span>
                      <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none">
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {(() => {
                    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && (productFilter === "All" || p.categoryId.toString() === productFilter));
                    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProducts.slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage).map(product => (
                            <div key={product.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group flex flex-col">
                              <div className="relative h-56 bg-gradient-to-b from-slate-50 to-white w-full p-6 flex items-center justify-center border-b border-slate-50 group-hover:bg-blue-50/30 transition-colors">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="max-h-full object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-500 ease-out" />
                                ) : (
                                  <span className="text-6xl opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">📦</span>
                                )}
                                {product.originalPrice > product.price && (
                                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30 animate-pulse">
                                    {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                  </div>
                                )}
                              </div>
                              <div className="p-6 flex flex-col flex-1 relative">
                                 <div className="absolute top-0 right-6 -translate-y-1/2 bg-slate-900 text-white font-black text-base px-4 py-2 rounded-xl shadow-lg border border-slate-700">
                                   ₹{product.price}
                                 </div>
                                 
                                 <p className="text-sm font-bold text-blue-500 mb-2 uppercase tracking-wider">{categories.find(c => c.id === product.categoryId)?.name || "Uncategorized"}</p>
                                 <h4 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight mb-4">{product.name}</h4>
                                 
                                 {product.originalPrice > product.price && (
                                   <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                                     <span className="text-slate-400">Regular:</span>
                                     <span className="text-slate-500 line-through">₹{product.originalPrice}</span>
                                     <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Save {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% (₹{(product.originalPrice - product.price).toFixed(0)})</span>
                                   </div>
                                 )}
                                 
                                 <div className="mt-auto flex gap-2 border-t border-slate-100 pt-5">
                                   <button onClick={() => openEditProductModal(product)} className="flex-1 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                      Edit Details
                                   </button>
                                   <button onClick={() => setProductToDelete({id: product.id, name: product.name})} className="w-12 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all group" title="Delete">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                   </button>
                                 </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {filteredProducts.length > itemsPerPage && (
                          <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                              <button disabled={productsPage === 1} onClick={() => setProductsPage(p => p - 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                              </button>
                              <span className="px-4 font-bold text-slate-700">Page {productsPage} of {totalPages}</span>
                              <button disabled={productsPage === totalPages} onClick={() => setProductsPage(p => p + 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

                            {/* TAB: ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Order Management</h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium">Review and process recent customer purchases</p>
                    </div>
                    <div className="relative z-10 group flex items-center gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 pr-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all duration-500 cursor-default overflow-hidden">
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Glowing Icon */}
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      
                      {/* Text content */}
                      <div className="flex flex-col relative z-10">
                        <span className="text-[10px] font-black text-amber-200/80 uppercase tracking-widest mb-0.5 group-hover:text-amber-100 transition-colors duration-300">Total Volume</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-white drop-shadow-md leading-none tracking-tight">{orders.length}</span>
                          <span className="text-sm font-bold text-amber-200/90">Orders</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 gap-1 w-full sm:w-auto">
                      <button onClick={() => setOrderFilterSource("All")} className={`flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-bold text-sm transition-all ${orderFilterSource === "All" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>All Orders</button>
                      <button onClick={() => setOrderFilterSource("Website")} className={`flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-bold text-sm transition-all ${orderFilterSource === "Website" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>Website</button>
                      <button onClick={() => setOrderFilterSource("POS")} className={`flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-bold text-sm transition-all ${orderFilterSource === "POS" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>POS Billing</button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    {(() => {
                      const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {filteredOrders.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center justify-center opacity-50">
                                        <span className="text-6xl mb-4">🛒</span>
                                        <p className="text-slate-500 font-bold">No orders found.</p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  filteredOrders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage).map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                      <td className="px-6 py-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-black text-sm border border-slate-200 group-hover:border-slate-300 transition-colors">
                                          #{order.id}
                                        </div>
                                        <div className="mt-2">
                                          {(order.source || 'Website') === 'POS' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-600 border border-indigo-200">
                                              🖥️ POS
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-600 border border-blue-200">
                                              🌐 Website
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="font-bold text-slate-900 text-base mb-1">{order.customerName || order.customer_name || "Walk-in Customer"}</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                          {(order.customerPhone || order.customer_phone) && <span>📞 {order.customerPhone || order.customer_phone}</span>}
                                        </div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="text-base font-medium text-slate-700">{new Date(order.createdAt || order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-sm text-slate-400 mt-1">{new Date(order.createdAt || order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="font-black text-slate-900 text-lg">₹{order.totalAmount || order.total_amount}</div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <select
                                          value={order.status || 'Pending'}
                                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                          className={`text-sm font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-colors shadow-sm
                                            ${(!order.status || order.status === 'Pending') ? 'bg-amber-50 text-amber-600 border-amber-200 focus:ring-amber-500/20' : 
                                              order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 focus:ring-emerald-500/20' :
                                              order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-200 focus:ring-blue-500/20' :
                                              order.status === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-200 focus:ring-purple-500/20' :
                                              order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200 focus:ring-red-500/20' :
                                              'bg-slate-50 text-slate-600 border-slate-200 focus:ring-slate-500/20'
                                            }`}
                                        >
                                          <option value="Pending">Pending</option>
                                          <option value="Processing">Processing</option>
                                          <option value="Shipped">Shipped</option>
                                          <option value="Completed">Completed</option>
                                          <option value="Cancelled">Cancelled</option>
                                        </select>
                                      </td>
                                      <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 transition-opacity">
                                          <button onClick={() => setViewingOrder(order)} className="w-9 h-9 bg-white text-indigo-600 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 shadow-sm transition-all" title="View Details">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                          </button>
                                          <button onClick={() => setOrderToDelete(order.id)} className="w-9 h-9 bg-white text-red-500 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-red-50 hover:border-red-200 shadow-sm transition-all" title="Delete Order">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                          {filteredOrders.length > itemsPerPage && (
                            <div className="flex justify-center my-6">
                              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                <button disabled={ordersPage === 1} onClick={() => setOrdersPage(p => p - 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                </button>
                                <span className="px-4 font-bold text-slate-700">Page {ordersPage} of {totalPages}</span>
                                <button disabled={ordersPage === totalPages} onClick={() => setOrdersPage(p => p + 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB: CUSTOMERS */}
              {activeTab === "customers" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Customers</h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium">Directory of customers from orders</p>
                    </div>
                    <div className="relative z-10 group flex items-center gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 pr-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_8px_32px_0_rgba(236,72,153,0.3)] hover:-translate-y-0.5 transition-all duration-500 cursor-default overflow-hidden">
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Glowing Icon */}
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/50 group-hover:scale-110 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      
                      {/* Text content */}
                      <div className="flex flex-col relative z-10">
                        <span className="text-[10px] font-black text-pink-200/80 uppercase tracking-widest mb-0.5 group-hover:text-pink-100 transition-colors duration-300">Total Customers</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-white drop-shadow-md leading-none tracking-tight">{uniqueCustomers.length}</span>
                          <span className="text-sm font-bold text-pink-200/90">Users</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {uniqueCustomers.length === 0 ? (
                      <div className="p-16 text-center">
                        <div className="text-6xl mb-4 opacity-50">👥</div>
                        <h3 className="text-lg font-bold text-slate-900">Customer Directory</h3>
                        <p className="text-slate-500 text-base mt-2">The customer directory is automatically populated from order history.</p>
                      </div>
                    ) : (
                      (() => {
                        const totalPages = Math.ceil(uniqueCustomers.length / itemsPerPage) || 1;
                        return (
                          <>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest w-16 text-center">S.No</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest w-1/3">Customer Info</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest text-center">Total Orders</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest">Total Spent</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest">Last Active</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {uniqueCustomers.slice((customersPage - 1) * itemsPerPage, customersPage * itemsPerPage).map((customer, index) => (
                                    <tr key={customer.key || index} className="hover:bg-slate-50/50 transition-colors group">
                                      <td className="px-6 py-5 text-center text-sm font-bold text-slate-400">
                                        {(customersPage - 1) * itemsPerPage + index + 1}
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-lg font-bold">
                                            {customer.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="font-bold text-slate-900 text-base mb-1">{customer.name}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                              <span>📞 {customer.phone}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-lg bg-slate-100 text-slate-700 font-black text-sm border border-slate-200">
                                          {customer.orderCount}
                                        </div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="font-black text-slate-900 text-base">₹{customer.totalSpent.toFixed(2)}</div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="text-base font-medium text-slate-700">{new Date(customer.lastOrderDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-sm text-slate-400 mt-1">{new Date(customer.lastOrderDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                      </td>
                                      <td className="px-6 py-5 text-right">
                                        <button onClick={() => setCustomerToDelete({ name: customer.name, key: customer.key })} className="w-9 h-9 bg-white text-red-500 border border-slate-200 rounded-lg inline-flex items-center justify-center hover:bg-red-50 hover:border-red-200 shadow-sm transition-all group" title="Delete Customer">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                          </svg>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {uniqueCustomers.length > itemsPerPage && (
                              <div className="flex justify-center my-6">
                                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                  <button disabled={customersPage === 1} onClick={() => setCustomersPage(p => p - 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                  </button>
                                  <span className="px-4 font-bold text-slate-700">Page {customersPage} of {totalPages}</span>
                                  <button disabled={customersPage === totalPages} onClick={() => setCustomersPage(p => p + 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()
                    )}
                  </div>
                </div>
              )}

              {/* TAB: REPORTS */}
              {activeTab === "reports" && (
                <div className="space-y-6 animate-slideDown print:space-y-0">
                  {/* Header - Hidden on Print */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Sales Reports</h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium">Analyze revenue by date, month, or year.</p>
                    </div>
                    
                    <button
                      onClick={() => window.print()}
                      className="mt-4 sm:mt-0 px-6 py-4 rounded-2xl bg-white/10 text-white border border-white/10 font-bold text-base hover:-translate-y-1 hover:bg-white/20 transition-all flex items-center gap-3 relative z-10 backdrop-blur-md"
                    >
                      <span>🖨️</span> Print Report
                    </button>
                  </div>

                  {/* Toggle Controls and Filters - Hidden on Print */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-6 print:hidden relative z-10">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 gap-1 w-full xl:w-auto">
                      <button
                        onClick={() => setReportType("date")}
                        className={`flex-1 xl:flex-none py-3 px-6 rounded-xl font-bold text-sm transition-all ${reportType === "date" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        Day
                      </button>
                      <button
                        onClick={() => setReportType("month")}
                        className={`flex-1 xl:flex-none py-3 px-6 rounded-xl font-bold text-sm transition-all ${reportType === "month" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setReportType("year")}
                        className={`flex-1 xl:flex-none py-3 px-6 rounded-xl font-bold text-sm transition-all ${reportType === "year" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        Year
                      </button>
                    </div>

                    <div className="flex items-end gap-3 w-full xl:w-auto">
                      <div className="flex-1 xl:flex-none flex flex-col relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">From Date</label>
                        <input type="date" value={reportFromDate} onChange={e => setReportFromDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full xl:w-44 transition-all text-slate-700" />
                      </div>
                      <div className="flex-1 xl:flex-none flex flex-col relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">To Date</label>
                        <input type="date" value={reportToDate} onChange={e => setReportToDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full xl:w-44 transition-all text-slate-700" />
                      </div>
                      <div className="h-[46px] flex items-center">
                        <button 
                          onClick={() => {setReportFromDate(""); setReportToDate("")}} 
                          disabled={!reportFromDate && !reportToDate}
                          className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${reportFromDate || reportToDate ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 cursor-pointer' : 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden'}`}
                        >
                          ✕ Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Report Table - This is what prints */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm print:shadow-none print:border-none print:m-0 print:p-0">
                    {/* Print Only Header */}
                    <div className="hidden print:block text-center py-8 border-b border-slate-200">
                      <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Sales Report</h1>
                      <p className="text-slate-500 mt-2 font-medium">
                        {reportType === 'date' ? 'Day' : reportType === 'month' ? 'Month' : 'Year'} Breakdown
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 print:bg-transparent print:border-b-2 print:border-slate-800">
                            <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest text-center w-24 print:text-slate-900">
                              S.No
                            </th>
                            <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest print:text-slate-900">
                              {reportType === "date" ? "Date" : reportType === "month" ? "Month" : "Year"}
                            </th>
                            <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest text-center print:text-slate-900">
                              Total Orders
                            </th>
                            <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest text-right print:text-slate-900">
                              Revenue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                          {salesReports[reportType].map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                              <td className="px-8 py-5 font-bold text-slate-400 text-center">
                                {idx + 1}
                              </td>
                              <td className="px-8 py-5 font-bold text-slate-900 text-base">
                                {row.key}
                              </td>
                              <td className="px-8 py-5 font-bold text-slate-600 text-center">
                                {row.orders}
                              </td>
                              <td className="px-8 py-5 font-black text-emerald-600 text-right text-lg print:text-slate-900">
                                ₹{row.revenue.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          {salesReports[reportType].length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-8 py-16 text-center text-slate-500 font-medium">
                                No sales data found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {salesReports[reportType].length > 0 && (
                          <tfoot className="bg-slate-50 border-t-2 border-slate-200 print:bg-transparent print:border-t-4 print:border-slate-800">
                            <tr>
                              <td colSpan={2} className="px-8 py-6 font-black text-slate-900 uppercase tracking-widest text-sm print:text-slate-900 text-right">
                                Grand Total
                              </td>
                              <td className="px-8 py-6 font-black text-slate-900 text-center text-lg print:text-slate-900">
                                {salesReports[reportType].reduce((a, c) => a + c.orders, 0)}
                              </td>
                              <td className="px-8 py-6 font-black text-emerald-600 text-right text-2xl print:text-slate-900">
                                ₹{salesReports[reportType].reduce((a, c) => a + c.revenue, 0).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BILLING */}
              {activeTab === "billing" && (
                <div className="flex flex-col lg:flex-row gap-6 animate-slideDown h-[calc(100vh-140px)]">
                  {/* Left: Product Selection */}
                  <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm min-h-0 overflow-hidden">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4 flex-shrink-0">POS Terminal</h2>
                    <div className="flex gap-3 mb-6 flex-shrink-0">
                      <input type="text" placeholder="Search product to bill..." value={billingSearch} onChange={e => setBillingSearch(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900" />
                      <select value={billingCategoryFilter} onChange={e => setBillingCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 w-40">
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          {products.filter(p => p.name.toLowerCase().includes(billingSearch.toLowerCase()) && (billingCategoryFilter === "All" || p.categoryId.toString() === billingCategoryFilter)).map(product => (
                            <div key={product.id} onClick={() => {
                               const existing = billingCart.find(i => i.id === product.id);
                               if(existing) setBillingCart(billingCart.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i));
                               else setBillingCart([...billingCart, {...product, quantity: 1}]);
                            }} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30 rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center text-center group">
                               {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="h-28 w-full object-contain mb-4 group-hover:scale-105 transition-transform" /> : <div className="h-28 text-5xl flex items-center justify-center mb-4 opacity-50 group-hover:scale-110 transition-transform">📦</div>}
                               <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2">{product.name}</h4>
                               <span className="text-lg font-black text-indigo-600 mt-auto bg-indigo-50 px-3 py-1 rounded-lg">₹{product.price}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                  
                  {/* Right: Cart & Billing */}

                    {/* Right: Cart & Billing */}
                    <div className="w-full lg:w-[450px] flex flex-col bg-slate-900 border border-slate-700 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden min-h-0 shrink-0">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                      <h3 className="text-xl font-black text-white tracking-tight mb-5 flex items-center justify-between border-b border-slate-700/50 pb-4 shrink-0 relative z-10">
                        <span>Current Bill</span>
                        <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner">{billingCart.reduce((a, c) => a + c.quantity, 0)} Items</span>
                      </h3>

                      {/* Cart Items List */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0 relative z-10">
                        {billingCart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-base font-bold tracking-tight italic opacity-60">
                            <span className="text-5xl mb-4">🛒</span>
                            Cart is empty
                          </div>
                        ) : (
                          billingCart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 hover:border-slate-500 transition-colors backdrop-blur-sm gap-3">
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-bold text-slate-200 block truncate" title={item.name}>{item.name}</span>
                                <span className="text-xs text-indigo-400 font-bold mt-0.5 block">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 shrink-0">
                                <button onClick={() => {
                                  if(item.quantity > 1) {
                                    setBillingCart(billingCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                                  } else {
                                    setBillingCart(billingCart.filter(i => i.id !== item.id));
                                  }
                                }} className="px-2 py-1 text-slate-400 hover:text-white font-black cursor-pointer text-xs">−</button>
                                <span className="px-1 py-1 text-xs font-black text-white w-6 text-center">{item.quantity}</span>
                                <button onClick={() => setBillingCart(billingCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} className="px-2 py-1 text-slate-400 hover:text-white font-black cursor-pointer text-xs">+</button>
                              </div>
                              <button 
                                onClick={() => setBillingCart(billingCart.filter(i => i.id !== item.id))}
                                className="text-slate-400 hover:text-red-400 rounded-lg p-1.5 transition-colors cursor-pointer shrink-0 text-sm"
                              >✕</button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Customer Info & Summary */}
                      <div className="mt-4 pt-4 border-t border-slate-700/50 shrink-0 relative z-10">
                        <div className="space-y-2 mb-4">
                          <input type="text" placeholder="Customer Name" value={billingCustomer.name} onChange={(e) => setBillingCustomer({...billingCustomer, name: e.target.value})} className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Phone" value={billingCustomer.phone} onChange={(e) => setBillingCustomer({...billingCustomer, phone: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500" />
                            <input type="email" placeholder="Email (Opt)" value={billingCustomer.email} onChange={(e) => setBillingCustomer({...billingCustomer, email: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500" />
                            <input type="text" placeholder="City" value={billingCustomer.city} onChange={(e) => setBillingCustomer({...billingCustomer, city: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500" />
                            <input type="text" placeholder="Address" value={billingCustomer.address} onChange={(e) => setBillingCustomer({...billingCustomer, address: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500" />
                          </div>
                        </div>

                        {(() => {
                          const subtotal = billingCart.reduce((a, c) => a + (c.originalPrice * c.quantity), 0);
                          const total = billingCart.reduce((a, c) => a + (c.price * c.quantity), 0);
                          const savings = subtotal - total;
                          
                          return (
                            <>
                              <div className="flex justify-between items-end mb-5 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                <div>
                                  <div className="text-xs text-slate-400 tracking-widest font-black uppercase mb-1">Total Amount</div>
                                  <div className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-md inline-block">Savings: ₹{savings.toFixed(2)}</div>
                                </div>
                                <div className="text-3xl font-black text-white tracking-tight">₹{total.toFixed(2)}</div>
                              </div>

                              <button
                                disabled={billingCart.length === 0 || isGeneratingBill}
                                onClick={async () => {
                                  if(!billingCustomer.name || !billingCustomer.phone || !billingCustomer.city) {
                                    showToast("Please fill customer details", "error");
                                    return;
                                  }
                                  setIsGeneratingBill(true);
                                  try {
                                    const orderData = {
                                      customer_name: billingCustomer.name,
                                      customer_phone: billingCustomer.phone,
                                      customer_email: billingCustomer.email,
                                      customer_city: billingCustomer.city,
                                      customer_address: billingCustomer.address || billingCustomer.city,
                                      total_amount: total,
                                      total_savings: savings,
                                      source: "POS",
                                      items: billingCart.map(item => ({
                                        id: item.id,
                                        name: item.name,
                                        category: item.category,
                                        price: item.price,
                                        originalPrice: item.originalPrice,
                                        quantity: item.quantity
                                      }))
                                    };

                                    const res = await fetch(`${apiUrl}/api/orders`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(orderData)
                                    });

                                    if(res.ok) {
                                      const newOrder = await res.json();
                                      // Correctly construct fullOrder for handlePrintOrder
                                      const fullOrder = { 
                                        ...orderData, 
                                        id: newOrder.orderId || Math.floor(Math.random() * 10000),
                                        created_at: new Date().toISOString()
                                      };
                                      showToast("Bill Generated Successfully!", "success");
                                      
                                      console.log("Order Placed Successfully!");
                                      if (newOrder.emailSent) {
                                        console.log("%c✅ SUCCESS: Email was sent to the Admin successfully!", "color: #10b981; font-weight: bold; font-size: 14px;");
                                      } else {
                                        console.log("%c⚠️ NOTE: Order saved, but Email was NOT sent (Check backend .env credentials)", "color: #f59e0b; font-weight: bold; font-size: 14px;");
                                      }
                                      setBillingCart([]);
                                      setBillingCustomer({ name: "", phone: "", email: "", city: "", address: "" });
                                      fetchData(); // Refresh orders list
                                      handlePrintOrder(fullOrder); // Print Invoice
                                    } else {
                                      showToast("Failed to generate bill", "error");
                                    }
                                  } catch (e) {
                                    showToast("Error processing bill", "error");
                                  } finally {
                                    setIsGeneratingBill(false);
                                  }
                                }}
                                className={`w-full py-4 rounded-xl font-black text-sm tracking-tight transition-all flex items-center justify-center gap-2 ${
                                  billingCart.length === 0 || isGeneratingBill
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] shadow-lg shadow-indigo-500/20 cursor-pointer border border-indigo-500/50'
                                }`}
                              >
                                {isGeneratingBill ? "Processing..." : (
                                  <><span>✨</span> Generate Bill</>
                                )}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
              )}

              {/* TAB: CONTACTS */}
              {activeTab === "contacts" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Contact Messages</h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium">Manage inquiries submitted from the website contact form</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <input 
                        type="text" 
                        placeholder="Search by name, phone or message..." 
                        value={contactsSearch} 
                        onChange={e => {
                          setContactsSearch(e.target.value);
                          setContactsPage(1);
                        }} 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:max-w-md" 
                      />
                      <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                        Total: {contacts.length} Messages
                      </div>
                    </div>

                    {(() => {
                      const filtered = contacts.filter(c => 
                        c.name.toLowerCase().includes(contactsSearch.toLowerCase()) ||
                        c.phone.toLowerCase().includes(contactsSearch.toLowerCase()) ||
                        c.message.toLowerCase().includes(contactsSearch.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="p-16 text-center">
                            <div className="text-6xl mb-4 opacity-50">✉️</div>
                            <h3 className="text-lg font-bold text-slate-900">No Messages Found</h3>
                            <p className="text-slate-500 text-base mt-2">No contact messages match your search filter or are available.</p>
                          </div>
                        );
                      }

                      const itemsPerPage = 10;
                      const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
                      const paginated = filtered.slice((contactsPage - 1) * itemsPerPage, contactsPage * itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto -mx-6">
                            <table className="w-full text-center border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-16 text-center">S.No</th>
                                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-1/5 text-center">Name</th>
                                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-1/5 text-center">Phone Number</th>
                                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-2/5 text-center">Message</th>
                                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Date</th>
                                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {paginated.map((contact, index) => (
                                  <tr key={contact.id || index} className={`hover:bg-slate-50/50 transition-colors group ${contact.is_read ? 'opacity-80' : 'font-semibold bg-indigo-50/10'}`}>
                                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-400">
                                      {(contactsPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                      <div className="flex items-center justify-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border shrink-0 ${
                                          contact.is_read ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                        }`}>
                                          {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="font-bold text-slate-900 text-base">{contact.name}</div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                      <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200/60 shadow-sm">
                                        <span>📞</span> {contact.phone}
                                      </a>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed break-words text-center">{contact.message}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center whitespace-nowrap">
                                      <div className="text-sm font-semibold text-slate-800 text-center">
                                        {new Date(contact.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(contact.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                      </div>
                                    </td>
                                    <td className="px-6 py-5 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleDeleteContact(contact.id)} className="w-9 h-9 bg-white text-red-500 border border-slate-200 rounded-lg inline-flex items-center justify-center hover:bg-red-50 hover:border-red-200 shadow-sm transition-all group cursor-pointer" title="Delete Message">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {filtered.length > itemsPerPage && (
                            <div className="flex justify-center mt-6">
                              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                <button disabled={contactsPage === 1} onClick={() => setContactsPage(p => p - 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                </button>
                                <span className="text-sm font-bold text-slate-800 px-4">Page {contactsPage} of {totalPages}</span>
                                <button disabled={contactsPage === totalPages} onClick={() => setContactsPage(p => p + 1)} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* FALLBACK FOR NEW DYNAMIC MODULES */}
              {!["overview", "categories", "products", "orders", "customers", "reports", "billing", "contacts"].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-[60vh] bg-[#180a27]/40 backdrop-blur-sm border border-slate-200 rounded-3xl p-10 text-center animate-slideDown shadow-xl shadow-black/20">
                  <div className="text-6xl mb-6 opacity-80">
                    {activeTab === "inventory" ? "📦" : activeTab === "customers" ? "👥" : activeTab === "offers" ? "🎁" : activeTab === "reports" ? "📈" : activeTab === "settings" ? "⚙️" : "✨"}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight  mb-3">
                    {activeTab} Module
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed">
                    This module is fully integrated into the sidebar navigation and is currently being prepared for the next release phase.
                  </p>
                  <button onClick={() => setActiveTab("overview" as any)} className="mt-8 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-900 font-bold text-sm  tracking-tight hover:bg-slate-50 transition-colors">
                    Return to Overview
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* CATEGORY CREATION/EDIT MODAL */}
      <div id="add-category-modal" className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-xl hidden overflow-y-auto">
        <div className="min-h-[100dvh] w-full flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-blue-500/30 rounded-[2rem] w-full max-w-md shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden animate-slideDown relative">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-transparent px-8 py-6 border-b border-slate-700 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-lg shadow-inner">
                  {editingCategory ? "✏️" : "✨"}
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("add-category-modal")?.classList.add("hidden");
                  setEditingCategory(null);
                  setNewCategoryName("");
                  setEditCategoryName("");
                }}
                className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center text-lg backdrop-blur-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="p-8 space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                  Category Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory ? editCategoryName : newCategoryName}
                  onChange={(e) => editingCategory ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-5 py-3.5 text-base text-white font-semibold outline-none transition-all placeholder-slate-400 shadow-inner"
                  placeholder="e.g. Flower Pots"
                />
                <p className="text-xs text-blue-300/60 mt-2 font-medium">✨ Tamil translation will be automatically generated</p>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                  Tamil Translation (Auto)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingCategory ? editCatTamilTranslation : newCatTamilTranslation}
                    onChange={(e) => editingCategory ? setEditCatTamilTranslation(e.target.value) : setNewCatTamilTranslation(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-5 py-3.5 text-base text-white font-semibold outline-none transition-all placeholder-slate-400 shadow-inner"
                    placeholder="e.g. மலர் பானைகள்"
                  />
                  {(isTranslatingNewCat || isTranslatingEditCat) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-400">
                      <span className="animate-spin text-lg">↻</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("add-category-modal")?.classList.add("hidden");
                    setEditingCategory(null);
                    setNewCategoryName("");
                    setEditCategoryName("");
                  }}
                  className="flex-[1] py-3.5 rounded-xl border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 text-base font-bold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {editingCategory ? (
                    <><span>💾</span> Save Changes</>
                  ) : (
                    <><span>✨</span> Create Category</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>


      {/* PRODUCT CREATION/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-blue-500/30 rounded-[2rem] w-full max-w-3xl shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden animate-slideDown my-8 relative">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-transparent px-8 py-6 border-b border-slate-700 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xl shadow-inner">
                  {editingProduct ? "✏️" : "✨"}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center text-lg backdrop-blur-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleProductSubmit} className="p-8 space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    onBlur={() => appendTamilTranslation(productName, productTamilTranslation, setProductName)}
                    placeholder="e.g. 1000 Wala Giant"
                    className="w-full bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl py-3.5 px-5 text-base font-semibold outline-none transition-all text-white placeholder-slate-400 shadow-inner"
                  />
                  {productTamilTranslation && (
                    <p className="mt-2 text-sm font-semibold text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg inline-block border border-blue-500/20 animate-pulse">
                      ✨ Tamil: {productTamilTranslation}
                    </p>
                  )}
                  {isTranslatingProduct && (
                    <p className="mt-2 text-sm italic text-blue-400/60 font-medium">
                      ⌛ Translating...
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                    Category Link
                  </label>
                  {categories.length === 0 ? (
                    <div className="text-red-400 text-sm font-medium py-3 px-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      ⚠️ Please create a category first!
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={productCategoryId}
                        onChange={(e) => setProductCategoryId(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl py-3.5 px-5 text-base font-semibold text-white outline-none transition-all appearance-none cursor-pointer shadow-inner"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-slate-800 text-white">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-5 col-span-1 md:col-span-2 bg-slate-700/30 p-5 rounded-2xl border border-slate-600/50">
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-blue-300">
                      Original Price
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={productOriginalPrice}
                        onChange={(e) => handleOriginalPriceChange(e.target.value)}
                        placeholder="250"
                        className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl py-3 px-4 pl-8 text-base font-bold outline-none transition-all text-white shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between h-5">
                      <label className="block text-xs font-black uppercase tracking-widest text-blue-300 mt-1">
                        Discount (Auto-calculated)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        disabled={true}
                        value={productDiscount || "0"}
                        placeholder="0"
                        title="Discount is calculated automatically from Original and Offer prices"
                        className="w-full bg-slate-800/40 border border-slate-700/80 text-slate-400 cursor-not-allowed rounded-xl py-3 px-4 pr-8 text-base font-bold outline-none transition-all shadow-inner"
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center font-bold text-slate-500">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-300">
                      Offer Price
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-amber-500 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={productPrice}
                        onChange={(e) => handleOfferPriceChange(e.target.value)}
                        placeholder="120"
                        className="w-full bg-slate-800 border border-amber-500/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 rounded-xl py-3 px-4 pl-8 text-base font-black outline-none transition-all text-amber-400 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Selection Section */}
              <div className="space-y-5">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                  <span className="w-5 h-5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">🖼️</span>
                  Product Image Source
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Preview & Upload */}
                  <div className="space-y-4 flex flex-col h-full">
                    <div className="flex-1 bg-slate-700/30 rounded-2xl p-4 border border-slate-600 flex flex-col justify-center items-center text-center gap-3 relative overflow-hidden group">
                      {productImage ? (
                        <>
                          <div className="absolute inset-0 bg-slate-800/50"></div>
                          <img
                            src={productImage}
                            alt="Product Preview"
                            className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="relative z-10 w-full mt-2">
                            <p className="text-xs text-slate-300 font-mono break-all bg-slate-900/60 px-2 py-1 rounded-md">{productImage}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 opacity-40">
                          <span className="text-4xl mb-2">📸</span>
                          <span className="text-slate-300 text-xs font-bold uppercase tracking-wide">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-base font-bold tracking-tight transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-inner"
                      >
                        {uploadingImage ? (
                          <>
                            <span className="animate-spin text-lg">↻</span> Uploading...
                          </>
                        ) : (
                          <>
                            <span className="text-lg">📁</span> Upload Custom Image
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Presets */}
                  <div className="bg-slate-700/30 rounded-2xl p-5 border border-slate-600">
                    <span className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4 block flex items-center gap-2">
                      <span>✨</span> Or choose preset
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {presetImages.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setProductImage(img.path)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                            productImage === img.path
                              ? "border-blue-500 bg-blue-500/20 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500"
                              : "border-slate-600 bg-slate-800 hover:border-blue-500/50 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="w-8 h-8 relative">
                            <img src={img.path} alt={img.label} loading="lazy" decoding="async" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-xs font-bold tracking-wide uppercase text-center">{img.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-3 rounded-xl border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 text-base font-bold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                >
                  {editingProduct ? (
                    <><span>💾</span> Save Changes</>
                  ) : (
                    <><span>✨</span> Create Product</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL DISCOUNT MODAL */}
      {showGlobalDiscountModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto font-['Outfit']">
          <div className="min-h-full w-full flex items-center justify-center">
            
            <div className="bg-slate-800 border border-amber-500/30 rounded-[2rem] w-full max-w-md shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden animate-slideDown relative">
              
              {/* Ambient Background Glows */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none"></div>

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-900/40 to-transparent px-8 py-6 border-b border-slate-700 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg shadow-inner">
                    🏷️
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Global Discount
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGlobalDiscountModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center text-lg backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8 relative z-10">
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Set a flat discount percentage for your entire catalog. This will recalculate the offer price for <strong className="text-amber-400">all products</strong> based on their original price instantly.
                </p>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-inner">
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-500 mb-6 text-center">
                    Set Discount Percentage
                  </label>
                  
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => {
                        const val = parseInt(globalDiscountValue) || 0;
                        if (val > 0) setGlobalDiscountValue(String(val - 5));
                      }}
                      className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-black text-xl hover:bg-slate-700 hover:text-amber-400 hover:border-amber-400/50 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                    >−</button>
                    
                    <div className="relative group">
                      <div className="relative flex items-center justify-center bg-slate-950 border-2 border-amber-500/50 rounded-2xl w-32 h-20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={globalDiscountValue}
                          onChange={(e) => setGlobalDiscountValue(e.target.value)}
                          className="w-full h-full bg-transparent text-center text-4xl font-black text-amber-400 outline-none appearance-none"
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <span className="absolute right-3 bottom-2 text-amber-500/70 font-black text-base">%</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const val = parseInt(globalDiscountValue) || 0;
                        if (val < 100) setGlobalDiscountValue(String(val + 5));
                      }}
                      className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-black text-xl hover:bg-slate-700 hover:text-amber-400 hover:border-amber-400/50 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                    >+</button>
                  </div>
                  
                  {/* Visualizer text */}
                  <div className="mt-8 text-center">
                    <span className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-600 px-4 py-2 rounded-xl text-xs text-slate-400 font-medium tracking-wide">
                      <span>A ₹1000 product will become</span>
                      <span className="text-amber-400 font-black text-sm bg-amber-400/10 px-2 py-0.5 rounded-md">₹{1000 - (1000 * (parseInt(globalDiscountValue) || 0) / 100)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 pb-8 flex gap-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setShowGlobalDiscountModal(false)}
                  disabled={isApplyingDiscount}
                  className="flex-1 py-3.5 rounded-xl bg-slate-700/50 border border-slate-600 hover:bg-slate-700 text-sm font-bold tracking-tight text-slate-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyGlobalDiscount}
                  disabled={isApplyingDiscount}
                  className="flex-[2] py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-sm tracking-tight transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isApplyingDiscount ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      Apply To All Products
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER ITEMS VIEW MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[60] bg-[#0a0514]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl w-[95vw] max-w-7xl overflow-hidden shadow-[0_0_80px_rgba(30,27,75,0.8)] animate-slideDown my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900/50 px-8 py-5 border-b border-slate-700/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">🛍️</div>
                  Order #{viewingOrder.id} Details
                </h3>
                <p className="text-slate-400 text-sm font-bold mt-1 tracking-tight">
                  Customer: <span className="text-indigo-300">{viewingOrder.customer_name}</span> | Total Items: <span className="text-indigo-300">{viewingOrder.items.length}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Items List */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow space-y-6 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/60 text-slate-400 text-xs font-black uppercase tracking-widest">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6 text-center">Quantity</th>
                      <th className="py-4 px-6 text-right">Net Price</th>
                      <th className="py-4 px-6 text-right text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30 text-base font-bold">
                    {viewingOrder.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-slate-200 font-black">{item.name}</td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-slate-800 px-3.5 py-1.5 rounded-lg text-indigo-300 border border-slate-700 shadow-inner">{item.quantity}</span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400">
                          <span className="font-semibold">₹{item.originalPrice}</span>
                        </td>
                        <td className="py-4 px-6 text-right text-white font-black">₹{item.originalPrice * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/60 border-t border-slate-700/50">
                    <tr>
                      <td colSpan={3} className="py-4 px-6 text-right text-sm font-black tracking-tight text-slate-400">Total Amount:</td>
                      <td className="py-4 px-6 text-right text-lg font-black text-white">₹{viewingOrder.total_amount + (viewingOrder.total_savings || 0)}</td>
                    </tr>
                    {(viewingOrder.total_savings || 0) > 0 && (
                      <tr className="border-t border-slate-700/30">
                        <td colSpan={3} className="py-3 px-6 text-right text-xs font-black tracking-tight text-emerald-400">
                          Discount ({Math.round(((viewingOrder.total_savings || 0) / (viewingOrder.total_amount + (viewingOrder.total_savings || 0))) * 100)}% OFF):
                        </td>
                        <td className="py-3 px-6 text-right text-base font-black text-emerald-400">-₹{viewingOrder.total_savings || 0}</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-700/50 bg-indigo-950/20">
                      <td colSpan={3} className="py-5 px-6 text-right text-base font-black tracking-tight text-indigo-200">Net Amount To Pay:</td>
                      <td className="py-5 px-6 text-right text-2xl font-black text-white">₹{viewingOrder.total_amount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-slate-900/50 border-t border-slate-700/50 px-8 py-5 flex justify-end gap-4 shrink-0">
              <button
                onClick={() => handlePrintOrder(viewingOrder)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-black tracking-tight transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 border border-indigo-400/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0v-2.94a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.94ZM15 10.125a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Z" />
                </svg>
                Print / Download PDF
              </button>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-8 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-sm font-black tracking-tight text-white transition-all shadow-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      {categoryToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setCategoryToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Category?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">&quot;{categoryToDelete.name}&quot;</strong>? All products inside this category will also be removed. This cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm tracking-tight hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm tracking-tight shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {productToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setProductToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Product?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900">&quot;{productToDelete.name}&quot;</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm tracking-tight hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm tracking-tight shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {orderToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setOrderToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900  tracking-tight mb-2">Delete Order?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to permanently delete order <strong className="text-slate-900">#{orderToDelete}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm  tracking-tight hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm  tracking-tight shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER DELETE CONFIRMATION MODAL */}
      {customerToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setCustomerToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900  tracking-tight mb-2">Delete Customer?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to permanently delete customer <strong className="text-slate-900">"{customerToDelete.name}"</strong>? This will delete all of their orders. This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setCustomerToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm  tracking-tight hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCustomer}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm  tracking-tight shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT DELETE CONFIRMATION MODAL */}
      {contactToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setContactToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900  tracking-tight mb-2">Delete Message?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to permanently delete this contact query? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setContactToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm  tracking-tight hover:bg-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteContact}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm  tracking-tight shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
}
