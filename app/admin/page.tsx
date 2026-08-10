"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { io } from "socket.io-client";
import FireworksCanvas from "../components/FireworksCanvas";
import LoginTransition from "../components/LoginTransition";
import * as xlsx from "xlsx";

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
  apply_discount?: number;
  image: string;
  categoryId: number;
  category?: string;
  is_active?: number | boolean;
  sort_order?: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function AdminDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "orders" | "customers" | "reports" | "billing" | "contacts" | "banner" | "inventory" | "offers" | "settings">("overview");
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
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Source filter
      if (orderFilterSource !== "All" && (o.source || 'Website') !== orderFilterSource) return false;
      
      // Payment filter
      if (orderPaymentFilter !== "All") {
        const paymentStat = o.payment_status || 'Unpaid';
        if (paymentStat !== orderPaymentFilter) return false;
      }
      
      // Status filter
      if (orderStatusFilter !== "All") {
        const stat = o.status || 'Pending';
        if (stat !== orderStatusFilter) return false;
      }
      
      // Search Query
      if (orderSearchQuery.trim() !== "") {
        const q = orderSearchQuery.toLowerCase();
        const customerName = (o.customerName || o.customer_name || "Walk-in Customer").toLowerCase();
        const phone = (o.customerPhone || o.customer_phone || "").toLowerCase();
        const orderIdStr = o.id.toString();
        const amountStr = (o.totalAmount || o.total_amount || "").toString();
        
        if (!customerName.includes(q) && !phone.includes(q) && !orderIdStr.includes(q) && !amountStr.includes(q)) {
          return false;
        }
      }
      
      return true;
    });
  }, [orders, orderFilterSource, orderPaymentFilter, orderStatusFilter, orderSearchQuery]);

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
    const socket = io(apiUrl || "http://localhost:5001");
    
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
  const [bannerText, setBannerText] = useState("");
  const [isBannerLoading, setIsBannerLoading] = useState(false);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [minOrderValue, setMinOrderValue] = useState("");
  const [isUpdatingMinOrder, setIsUpdatingMinOrder] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/settings/banner-text/get`);
        if (res.ok) {
          const data = await res.json();
          setBannerText(data.text || "");
        }
      } catch(e) {}
    };
    const fetchBannerImages = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/settings/banner-images/get`);
        if (res.ok) {
          const data = await res.json();
          const images = (data.images || []).filter(Boolean).map((imgUrl: string) => {
              if (imgUrl.includes('localhost:5000') || imgUrl.includes('localhost:5001')) {
                  try {
                      const path = new URL(imgUrl).pathname;
                      return `${apiUrl}${path}`;
                  } catch (e) {
                      return imgUrl;
                  }
              }
              if (typeof window !== 'undefined' && window.location.protocol === 'https:' && imgUrl.startsWith('http://')) {
                  return imgUrl.replace('http://', 'https://');
              }
              return imgUrl;
          });
          setBannerImages(images);
        }
      } catch(e) {}
    };
    const fetchMinOrderValue = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/settings/min-order-value/get`);
        if (res.ok) {
          const data = await res.json();
          setMinOrderValue(data.value || "");
        }
      } catch(e) {}
    };
    fetchBanner();
    fetchBannerImages();
    fetchMinOrderValue();
  }, [apiUrl]);

  const handleUpdateBanner = async () => {
    setIsBannerLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/settings/banner-text/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bannerText })
      });
      if (res.ok) {
        showToast("Banner text updated successfully!", "success");
      } else {
        showToast("Error updating banner text.", "error");
      }
    } catch (error) {
      showToast("Error updating banner text.", "error");
    } finally {
      setIsBannerLoading(false);
    }
  };

  const handleUpdateMinOrderValue = async () => {
    setIsUpdatingMinOrder(true);
    try {
      const res = await fetch(`${apiUrl}/api/settings/min-order-value/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: minOrderValue })
      });
      if (res.ok) {
        showToast("Minimum order value updated successfully!", "success");
      } else {
        showToast("Error updating minimum order value.", "error");
      }
    } catch (error) {
      showToast("Error updating minimum order value.", "error");
    } finally {
      setIsUpdatingMinOrder(false);
    }
  };

  const handleSaveBannerImages = async (newImages: string[]) => {
    try {
      const res = await fetch(`${apiUrl}/api/settings/banner-images/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages })
      });
      if (!res.ok) throw new Error("Failed to update banner images");
    } catch(e) {
      console.error(e);
      showToast("Error updating banner images.");
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      let rawUrl = data.url || data.fileUrl;
      if (!rawUrl) throw new Error("No URL returned from server");
      
      if (rawUrl.includes('localhost:5000') || rawUrl.includes('localhost:5001')) {
          try {
              const path = new URL(rawUrl).pathname;
              rawUrl = `${apiUrl}${path}`;
          } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && rawUrl.startsWith('http://')) {
          rawUrl = rawUrl.replace('http://', 'https://');
      }

      const newImages = [...bannerImages, rawUrl];
      setBannerImages(newImages);
      await handleSaveBannerImages(newImages);
      showToast("Banner image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Error uploading banner image.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBannerImage = async (index: number) => {
    const newImages = bannerImages.filter((_, i) => i !== index);
    setBannerImages(newImages);
    await handleSaveBannerImages(newImages);
    showToast("Banner image removed.");
  };

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
          totalPaid: 0,
          totalUnpaid: 0,
          orderCount: 0,
          lastOrderDate: orderDate
        });
      }

      const customer = customerMap.get(key);
      const amount = parseFloat(orderAmount) || 0;
      customer.totalSpent += amount;
      customer.orderCount += 1;
      
      const pStatus = order.payment_status || 'Unpaid';
      if (pStatus === 'Paid') {
        customer.totalPaid += amount;
      } else {
        customer.totalUnpaid += amount;
      }
      
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
      if (!dateStr || order.payment_status !== 'Paid') return false;
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
  const [updatingStatusForId, setUpdatingStatusForId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [additionalDiscountType, setAdditionalDiscountType] = useState<"amount" | "percentage">("amount");
  const [additionalDiscountValue, setAdditionalDiscountValue] = useState<string>("");
  const [packingCharge, setPackingCharge] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [addQty, setAddQty] = useState<string>("1");
  const [stagedProducts, setStagedProducts] = useState<{productId: string, qty: string}[]>([{productId: "", qty: "1"}]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: number, name: string} | null>(null);
  const [productToDelete, setProductToDelete] = useState<{id: number, name: string} | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<{name: string, key: string} | null>(null);

  // Pagination states
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
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
  const [productIsActive, setProductIsActive] = useState(true);
  const [productSortOrder, setProductSortOrder] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productImage, setProductImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk Upload states
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const bulkUploadInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

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

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return uniqueCustomers;
    const lower = customerSearchTerm.toLowerCase();
    return uniqueCustomers.filter(c => 
      (c.name || "").toLowerCase().includes(lower) || 
      (c.phone || "").toLowerCase().includes(lower)
    );
  }, [uniqueCustomers, customerSearchTerm]);

  const downloadExcel = () => {
    const header = ["Name", "Phone", "Total Orders", "Total Spent", "Total Paid", "Total Unpaid", "Last Active"];
    const rows = filteredCustomers.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      c.orderCount,
      c.totalSpent,
      c.totalPaid,
      c.totalUnpaid,
      `"${new Date(c.lastOrderDate).toLocaleString()}"`
    ].join(","));
    
    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  const toggleApplyDiscount = async (product: Product) => {
    try {
      const newStatus = product.apply_discount === 1 ? false : true;
      const res = await fetch(`${apiUrl}/api/products/${product.id}/toggle-discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyDiscount: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle discount status");
      
      showToast(newStatus ? "Global discount enabled for product" : "Global discount disabled. Price reverted to original.", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

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

  const handleBulkDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) return;

    try {
      const res = await fetch(`${apiUrl}/api/products/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedProductIds })
      });
      
      if (res.ok) {
        showToast(`Successfully deleted ${selectedProductIds.length} products`, "success");
        setSelectedProductIds([]);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete products", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete products", "error");
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
      setUpdatingStatusForId(orderId);
      
      // Optimistic update
      setOrders(orders.map(o => o.id === orderId ? { 
        ...o, 
        status: newStatus, 
        ...(newStatus === 'Processing' ? { payment_status: 'Paid' } : {}) 
      } : o));
      
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ 
          ...viewingOrder, 
          status: newStatus, 
          ...(newStatus === 'Processing' ? { payment_status: 'Paid' } : {}) 
        });
      }

      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast("Order status updated", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update status", "error");
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
      fetchData();
    } finally {
      setUpdatingStatusForId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatusForId(orderId);
      
      // Optimistic update
      setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, payment_status: newStatus });
      }

      const res = await fetch(`${apiUrl}/api/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus })
      });
      if (res.ok) {
        showToast("Payment status updated", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update payment status", "error");
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update payment status", "error");
      fetchData();
    } finally {
      setUpdatingStatusForId(null);
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

  const showToast = (message: string, type: "success" | "error" = "success") => {
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
    setProductIsActive(true);
    setProductSortOrder("");
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
    setProductApplyDiscount(product.apply_discount !== undefined ? Boolean(product.apply_discount) : true);
    setProductIsActive(product.is_active !== undefined ? Boolean(product.is_active) : true);
    setProductSortOrder(product.sort_order !== undefined ? product.sort_order.toString() : "0");
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

  const downloadTemplate = () => {
    const ws = xlsx.utils.json_to_sheet([
      {
        "Product Name": "Example Cracker",
        "Category": "Sparklers",
        "Original Price": 150,
        "Offer Price": 120,
        "Discount Percentage": 20,
        "Global Discount": "Yes",
        "Sort Order": 1,
        "Status": "Active"
      }
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Template");
    xlsx.writeFile(wb, "Vamsi_Crackers_Bulk_Template.xlsx");
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBulkUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = xlsx.utils.sheet_to_json(worksheet);

      if (!json || json.length === 0) {
        throw new Error("No data found in the uploaded file");
      }

      const res = await fetch(`${apiUrl}/api/products/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Bulk upload failed");

      showToast(`Bulk upload success: ${resData.addedCount} products added.`, "success");
      if (resData.errorCount > 0) {
        console.error("Bulk upload errors:", resData.errors);
        showToast(`${resData.errorCount} products failed. Check console.`, "error");
      }
      
      fetchData(); // Refresh data
    } catch (err: any) {
      showToast(err.message || "Error processing bulk upload", "error");
    } finally {
      setIsBulkUploading(false);
      if (bulkUploadInputRef.current) bulkUploadInputRef.current.value = "";
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

    const payload = {
      name: finalProductName,
      price: parseFloat(productPrice),
      originalPrice: parseFloat(productOriginalPrice),
      discount: finalDiscount,
      applyDiscount: productApplyDiscount,
      isActive: productIsActive,
      sortOrder: parseInt(productSortOrder) || 0,
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
        setProducts((prev) => [...prev, data]);
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
          <!-- Application Theme Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #2a0845 0%, #4a1c6a 100%); padding: 25px 30px; margin-bottom: 25px; border-bottom: 4px solid #f59e0b; border-radius: 12px 12px 0 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
            
            <!-- Left: Logo & Core Info -->
            <div style="display: flex; align-items: center; z-index: 1;">
              <div style="margin-right: 25px; display: flex; align-items: center; justify-content: center; width: 100px; height: 100px; border-radius: 50%; overflow: hidden;">
                <img src="${window.location.origin}/assets/images/vamsi_crackers_logo_v2.png" alt="Vamsi Crackers" style="width: 100%; height: 100%; object-fit: cover; filter: drop-shadow(0px 2px 8px rgba(255,255,255,0.2)); transform: scale(1.15);" />
              </div>
              
              <div>
                <h1 style="margin: 0 0 6px 0; font-size: 28px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; text-shadow: 1px 1px 3px rgba(0,0,0,0.6);">
                  <span style="color: #ffffff;">VAMSI</span> <span style="color: #fbbf24;">CRACKERS</span>
                </h1>
                <div style="font-size: 15px; font-weight: 800; color: #fbbf24; margin-bottom: 6px; letter-spacing: 0.5px;">PROPRIETOR: <span style="color: #ffffff;">SWETHA</span></div>
                <div style="font-size: 13px; color: #e2e8f0; max-width: 350px; line-height: 1.5; font-weight: 500;">
                  D.NO. 177/5/18, Pernaickenpatti,<br/>Sithurajapuram, Virudhunagar, Tamil Nadu 626 189, India
                </div>
              </div>
            </div>

            <!-- Right: Contact Info -->
            <div style="display: flex; flex-direction: column; gap: 6px; z-index: 1; align-items: flex-end; font-size: 13px; font-weight: 600; color: #f8fafc;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; line-height: 1;">📱</span> +91 90800 19031
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; line-height: 1;">✉️</span> vamsidharuncrackers@gmail.com
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; line-height: 1;">🌐</span> <a href="https://www.vamsicrackers.in" target="_blank" style="color: #fbbf24; text-decoration: underline; font-weight: bold;">www.vamsicrackers.in</a>
              </div>
            </div>
          </div>

          <div class="header-title">SALES REPORT</div>
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

  const handleAddProductToOrder = async () => {
    const validStages = stagedProducts.filter(sp => sp.productId !== "" && Number(sp.qty) > 0);
    if (validStages.length === 0) {
      showToast("Please select at least one product and valid quantity.", "error");
      return;
    }
    
    let newItems = [...viewingOrder.items];
    let addedCount = 0;
    
    for (const sp of validStages) {
      const product = products.find(p => String(p.id) === String(sp.productId));
      if (!product) continue;
      
      const existingItemIdx = newItems.findIndex((item: any) => item.name === product.name);
      const qty = Number(sp.qty);
      
      if (existingItemIdx !== -1) {
        newItems[existingItemIdx] = {
          ...newItems[existingItemIdx],
          quantity: newItems[existingItemIdx].quantity + qty
        };
      } else {
        newItems.push({
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: qty
        });
      }
      addedCount++;
    }
    
    if (addedCount === 0) {
      showToast("No valid products found in catalog.", "error");
      return;
    }
    
    // Recalculate totals
    const newTotalOriginal = newItems.reduce((sum, item) => sum + (Number(item.originalPrice) * Number(item.quantity)), 0);
    const newTotalOffer = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const newTotalSavings = newTotalOriginal > newTotalOffer ? newTotalOriginal - newTotalOffer : 0;
    
    try {
      const res = await fetch(`${apiUrl}/api/orders/${viewingOrder.id}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: newItems,
          total_amount: newTotalOffer,
          total_savings: newTotalSavings
        })
      });
      
      if (!res.ok) throw new Error("Failed to update order items");
      
      // Update local state
      const updatedOrder = { ...viewingOrder, items: newItems, total_amount: newTotalOffer, total_savings: newTotalSavings };
      setViewingOrder(updatedOrder);
      
      // Update in orders array
      setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      
      showToast("Products added to order successfully!", "success");
      setStagedProducts([{productId: "", qty: "1"}]);
      setIsAddProductModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Error adding products to order", "error");
    }
  };

  const handleRemoveProductFromOrder = async (indexToRemove: number) => {
    let newItems = [...viewingOrder.items];
    newItems.splice(indexToRemove, 1);
    
    // Recalculate totals
    const newTotalOriginal = newItems.reduce((sum, item) => sum + (Number(item.originalPrice) * Number(item.quantity)), 0);
    const newTotalOffer = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const newTotalSavings = newTotalOriginal > newTotalOffer ? newTotalOriginal - newTotalOffer : 0;
    
    try {
      const res = await fetch(`${apiUrl}/api/orders/${viewingOrder.id}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: newItems,
          total_amount: newTotalOffer,
          total_savings: newTotalSavings
        })
      });
      
      if (!res.ok) throw new Error("Failed to update order items");
      
      const updatedOrder = { ...viewingOrder, items: newItems, total_amount: newTotalOffer, total_savings: newTotalSavings };
      setViewingOrder(updatedOrder);
      setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      
      showToast("Product removed from order successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Error removing product from order", "error");
    }
  };


  const getInvoiceHTML = (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return null;
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
    const allItems = [...discountedItems, ...netRateItems];

    const discountedTotalOriginal = discountedItems.reduce((acc: number, item: any) => acc + (Number(item.originalPrice) * Number(item.quantity)), 0);
    const discountedTotalOffer = discountedItems.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);
    const netRateTotal = netRateItems.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);

    const grossTotal = discountedTotalOriginal + netRateTotal;
    
    let totalAmountBase = Number(order.total_amount || 0);
    const extraDiscVal = Number(extraDiscValue || 0);
    let extraDiscountAmt = 0;
    if (extraDiscVal > 0) {
      if (extraDiscType === "percentage") {
        extraDiscountAmt = (totalAmountBase * extraDiscVal) / 100;
      } else {
        extraDiscountAmt = extraDiscVal;
      }
    }
    const packingChargeVal = Number(packingChargeStr || 0);
    const previousTotal = totalAmountBase;
    const totalAmount = previousTotal - extraDiscountAmt + packingChargeVal;
    const totalQty = allItems.reduce((sum, item) => sum + Number(item.quantity), 0);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice #{String(order.id).padStart(4, '0')}</title>
          <style>
            @page { margin: 0; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; max-width: 210mm; margin: 0 auto; font-size: 12px; padding: 10mm; }
            table { width: 100%; border-collapse: collapse; margin-top: -1px; }
            th, td { border: 1px solid #94a3b8; padding: 4px 6px; }
            th { text-align: center; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="display: flex; border: 1px solid #94a3b8; font-size: 12px;">
            <div style="width: 33.33%; padding: 5px; border-right: 1px solid #94a3b8;">GSTIN : </div>
            <div style="width: 33.33%; padding: 5px; border-right: 1px solid #94a3b8; text-align: center; font-weight: bold; background-color: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact;">TAX INVOICE</div>
            <div style="width: 33.34%; padding: 5px; text-align: right;">Original Copy</div>
          </div>
          
          <div style="display: flex; border: 1px solid #94a3b8; border-top: none;">
            <div style="width: 65%; border-right: 1px solid #94a3b8; padding: 10px; display: flex; align-items: center;">
              <div style="margin-right: 15px;">
                <img src="${window.location.origin}/assets/images/vamsi_crackers_logo_v2.png" alt="Logo" style="width: 80px; height: 80px; object-fit: contain; background: #2a0845; border-radius: 50%; padding: 5px;" />
              </div>
              <div>
                <h1 style="margin: 0 0 5px 0; font-size: 18px; color: #1e3a8a;">Vamsi Crackers</h1>
                <p style="margin: 0; font-size: 11px; color: #4b5563;">D.NO. 177/5/18, Pernaickenpatti, Sithurajapuram,<br/>Virudhunagar, Tamil Nadu 626 189, India<br/>Mobile: +91 90800 19031 | Web: www.vamsicrackers.in</p>
              </div>
            </div>
            <div style="width: 35%; padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px;">Bill To:</h3>
              <p style="margin: 0; font-size: 12px;" class="bold">Mr/Mrs. ${order.customer_name || 'Walk-in Customer'}</p>
              <p style="margin: 0; font-size: 12px;">${order.customer_city ? order.customer_city + ', ' : ''}${order.customer_address || ''}</p>
              <p style="margin: 0; font-size: 12px;">Contact: ${order.customer_phone || ''}</p>
            </div>
          </div>
          
          <div style="display: flex; border: 1px solid #94a3b8; border-top: none; text-align: center;">
            <div style="width: 33.33%; padding: 5px; border-right: 1px solid #94a3b8;">
              <div style="color: #4b5563; margin-bottom: 3px;">Order No</div>
              <div class="bold">{String(order.id).padStart(4, '0')}</div>
            </div>
            <div style="width: 33.33%; padding: 5px; border-right: 1px solid #94a3b8;">
              <div style="color: #4b5563; margin-bottom: 3px;">Receipt No</div>
              <div class="bold">INV-{String(order.id).padStart(4, '0')}</div>
            </div>
            <div style="width: 33.34%; padding: 5px;">
              <div style="color: #4b5563; margin-bottom: 3px;">Date</div>
              <div class="bold">${new Date(order.created_at || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '-')}</div>
            </div>
          </div>
          
          <table style="border-top: none;">
            <thead>
              <tr>
                <th style="width: 5%;">S.No</th>
                <th style="width: 35%;" class="text-left">ITEM</th>
                <th style="width: 8%;">Qty</th>
                <th style="width: 12%;">MRP</th>
                <th style="width: 16%;">DISC</th>
                <th style="width: 12%;">PRICE</th>
                <th style="width: 12%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${allItems.map((item: any, idx: number) => {
                const isNetRate = Number(item.originalPrice) <= Number(item.price);
                const mrp = isNetRate ? Number(item.price) : Number(item.originalPrice);
                const offerPrice = Number(item.price);
                const itemDiscPercent = isNetRate ? "0" : (((mrp - offerPrice)/mrp)*100).toFixed(0);
                const amount = offerPrice * Number(item.quantity);
                return `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${item.name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">₹ ${mrp.toFixed(0)}</td>
                    <td class="text-center">${itemDiscPercent}% (Rs.${(mrp - offerPrice).toFixed(0)})</td>
                    <td class="text-right">₹ ${offerPrice.toFixed(0)}</td>
                    <td class="text-right">₹ ${amount.toFixed(0)}</td>
                  </tr>
                `;
              }).join('')}
              
              <tr>
                <td colspan="2" class="text-right bold">Total Qty</td>
                <td class="text-center bold">${totalQty}</td>
                <td colspan="3"></td>
                <td class="text-right bold">₹ ${previousTotal.toFixed(0)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-left bold" style="vertical-align: middle;">${numberToWords(totalAmount)}</td>
                <td colspan="2" class="text-right bold" style="white-space: nowrap; vertical-align: middle;">Total Tax : ₹ ${(packingChargeVal - extraDiscountAmt).toFixed(0)}</td>
                <td colspan="2" class="text-right bold" style="background-color: #65a30d; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; white-space: nowrap; font-size: 13px; vertical-align: middle;">Total Due : ₹ ${Math.max(0, totalAmount).toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="display: flex; border: 1px solid #94a3b8; border-top: none;">
            <div style="width: 65%; padding: 5px; border-right: 1px solid #94a3b8;">
              <div class="bold" style="margin-bottom: 5px; color: #1e3a8a;">Bank Details</div>
              <table style="width: 100%; font-size: 11px; border: none; margin-top: 0;">
                <tr><td style="border: none; padding: 2px;">Acc Holder</td><td style="border: none; padding: 2px;" class="bold">SWETHA S .</td></tr>
                <tr><td style="border: none; padding: 2px;">Acc No</td><td style="border: none; padding: 2px;" class="bold">403100050600180</td></tr>
                <tr><td style="border: none; padding: 2px;">Acc Type</td><td style="border: none; padding: 2px;">Savings Account</td></tr>
                <tr><td style="border: none; padding: 2px;">Bank</td><td style="border: none; padding: 2px;">TMBL SITHURAJAPURAM</td></tr>
                <tr><td style="border: none; padding: 2px;">IFSC</td><td style="border: none; padding: 2px;">TMBL0000403</td></tr>
              </table>
            </div>
            <div style="width: 35%; padding: 5px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; font-weight: bold;">
              Authorized Signatory
            </div>
          </div>
          
          <div style="border: 1px solid #94a3b8; border-top: none; padding: 5px; font-size: 11px; color: #4b5563;">
            <div style="margin-bottom: 3px;">Terms & Conditions</div>
            <div>* Invoice was created on a computer and is invalid without the signature and seal.</div>
            <div>* Goods once sold cannot be taken back or exchanged.</div>
          </div>
          
          <div style="border: 1px solid #94a3b8; border-top: none; padding: 8px; text-align: center; background-color: #fef08a; color: #854d0e; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
            <div style="margin-bottom: 2px;">Thank You for your business with Vamsi Crackers</div>
            <div style="font-weight: normal;">For any queries, please contact +91 90800 19031</div>
          </div>
        </body>
      </html>
    `;

    return html;
  };

  const handlePrintOrder = (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print invoices", "error");
      return;
    }
    
    const html = getInvoiceHTML(order, extraDiscType, extraDiscValue, packingChargeStr);
    if (!html) return;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const handleWhatsAppShare = async (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return;
    const html = getInvoiceHTML(order, extraDiscType, extraDiscValue, packingChargeStr);
    if (!html) return;
    
    try {
      showToast("Generating PDF for WhatsApp...", "success");
      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;
      
      const container = document.createElement('div');
      container.innerHTML = html;
      
      const opt = {
        margin:       0,
        filename:     `Estimate_${order.id}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      const file = new File([pdfBlob], `Estimate_${order.id}.pdf`, { type: 'application/pdf' });
      let shared = false;
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Estimate ${order.id}`,
            text: `Hi ${order.customer_name}, here is your estimate quotation from Vamsi Crackers.`
          });
          shared = true;
        } catch (err) {
          console.log("Share failed, falling back to download", err);
        }
      }
      
      if (!shared) {
        // Download fallback
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estimate_${order.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast("PDF downloaded. Please attach it in WhatsApp.", "success");
        
        let phone = order.customer_phone.replace(/\D/g,'');
        if (phone.length === 10) phone = '91' + phone;
        const text = `Hi ${order.customer_name}, here is your estimate quotation (PDF) from Vamsi Crackers. I am sending the document now.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch(err: any) {
      console.error(err);
      showToast("Failed to generate PDF.", "error");
    }
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
                <img src="/assets/images/vamsi_crackers_logo.png" alt="Logo" className="w-full h-full object-cover rounded-[1.25rem]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white tracking-tight leading-tight mb-2 drop-shadow-lg uppercase">
                Admin Panel
              </h1>
              <p className="text-[9px] md:text-[11px] font-black text-amber-400/80 tracking-[0.3em] uppercase mt-2">Vamsi Crackers</p>
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
              <img src="/assets/images/vamsi_crackers_logo.png" alt="Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-black text-white tracking-tight uppercase leading-tight flex items-center">
                Vamsi
                <span className="text-amber-400 text-sm ml-1">Crackers</span>
              </h1>
              <p className="text-[10.5px] font-black text-indigo-400 tracking-widest uppercase mt-0.5">Admin Portal</p>
            </div>
          </div>
          <div className="px-6 py-2 text-sm font-bold tracking-widest uppercase text-slate-500 mb-2 mt-2">
            Dashboards
          </div>
          <nav className="flex-1 px-4 space-y-4 overflow-y-auto custom-scrollbar">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "categories", label: "Categories", icon: "🏷️" },
              { id: "products", label: "Products", icon: "🛍️" },
              { id: "orders", label: "Orders", icon: "🛒" },
              { id: "customers", label: "Customers", icon: "👥" },
              { id: "contacts", label: "Contact Us", icon: "✉️" },
              { id: "reports", label: "Sales Reports", icon: "📈" },
              { id: "billing", label: "POS Billing", icon: "🧾" },
              { id: "banner", label: "Banner", icon: "🖼️" },
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
          <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#0a0514] border-b border-white/5 shrink-0 relative z-30 print:hidden">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 text-white hover:text-indigo-400 focus:outline-none transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white p-0.5 overflow-hidden border border-amber-400/40">
                <img src="/assets/images/vamsi_crackers_logo.png" alt="Logo" className="w-full h-full object-contain rounded-sm" />
              </div>
              <span className="font-black text-white text-xs uppercase tracking-wider">Vamsi</span>
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
                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">New Order #{String(order.id).padStart(4, '0')}</p>
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
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-200 drop-shadow-md">₹{orders.filter(c => c.payment_status === "Paid").reduce((a,c) => a + (parseFloat(c.totalAmount || c.total_amount) || 0), 0).toFixed(2)}</p>
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
                      <div key={i} onClick={() => setActiveTab(stat.tab as any)} className={`cursor-pointer rounded-3xl p-6 border border-white/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between ${stat.color}`}>
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
                  <div className="grid grid-cols-1 gap-6 mt-8">
                    {/* Quick Management */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <button
                          onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setProductSortOrder(""); setIsProductModalOpen(true); }}
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

                        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mb-4 text-amber-500">
                            ₹
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mb-2">Min Order Value</h4>
                          <div className="flex w-full gap-2">
                            <input 
                              type="number" 
                              value={minOrderValue}
                              onChange={(e) => setMinOrderValue(e.target.value)}
                              placeholder="Amount" 
                              className="w-full text-center px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 focus:outline-none focus:border-amber-400"
                            />
                            <button 
                              onClick={handleUpdateMinOrderValue}
                              disabled={isUpdatingMinOrder}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                              {isUpdatingMinOrder ? '...' : 'Set'}
                            </button>
                          </div>
                        </div>
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
                               <button onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name.replace(/\s*\(.*\)\s*/g, "").trim()); const m = cat.name.match(/\((.*?)\)/); setEditCatTamilTranslation(m ? m[1] : ""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors" title="Edit">
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
                        onClick={downloadTemplate}
                        className="flex-1 lg:flex-none px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                        title="Download Excel Template for Bulk Upload"
                      >
                        <span>📄</span> Template
                      </button>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={bulkUploadInputRef}
                        onChange={handleBulkUpload}
                      />
                      <button
                        onClick={() => bulkUploadInputRef.current?.click()}
                        disabled={isBulkUploading}
                        className="flex-1 lg:flex-none px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 backdrop-blur-md disabled:opacity-50"
                      >
                        {isBulkUploading ? (
                          <><span className="animate-spin">↻</span> Uploading...</>
                        ) : (
                          <><span>📁</span> Bulk Upload</>
                        )}
                      </button>
                      {selectedProductIds.length > 0 && (
                        <button
                          onClick={handleBulkDeleteProducts}
                          className="flex-1 lg:flex-none px-6 py-4 rounded-2xl bg-red-500 text-white font-bold text-base hover:bg-red-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                        >
                          <span className="text-white">🗑️</span> Delete Selected ({selectedProductIds.length})
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setProductSortOrder(""); setIsProductModalOpen(true); }}
                        className="flex-1 lg:flex-none px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base hover:-translate-y-1 hover:shadow-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      >
                        <span className="text-blue-600">➕</span> Add Product
                      </button>
                    </div>
                  </div>
                  
                  {(() => {
                    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && (productFilter === "All" || p.categoryId.toString() === productFilter));
                    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
                    return (
                      <>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-center shrink-0">
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-4 py-3.5 rounded-xl transition-colors border border-slate-100">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds(filteredProducts.map(p => p.id));
                                  } else {
                                    setSelectedProductIds([]);
                                  }
                                }}
                              />
                              <span className="font-bold text-slate-700 text-sm">Select All</span>
                            </label>
                          </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProducts.slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage).map(product => (
                            <div key={product.id} className={`bg-white border ${selectedProductIds.includes(product.id) ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-slate-100 shadow-sm'} rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group flex flex-col`}>
                              <div className="relative h-56 bg-gradient-to-b from-slate-50 to-white w-full p-6 flex items-center justify-center border-b border-slate-50 group-hover:bg-blue-50/30 transition-colors">
                                <label className="absolute top-4 right-4 z-20 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedProductIds.includes(product.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProductIds(prev => [...prev, product.id]);
                                      } else {
                                        setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                      }
                                    }}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </label>
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
                                 
                                 <div className="flex items-center justify-between mb-2">
                                   <p className="text-sm font-bold text-blue-500 uppercase tracking-wider">{categories.find(c => c.id === product.categoryId)?.name || "Uncategorized"}</p>
                                   <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${(product.is_active === 1 || product.is_active === true || product.is_active === undefined) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                     {(product.is_active === 1 || product.is_active === true || product.is_active === undefined) ? 'ACTIVE' : 'INACTIVE'}
                                   </span>
                                 </div>
                                 <h4 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight mb-4">{product.name}</h4>
                                 
                                 {product.originalPrice > product.price && (
                                   <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                                     <span className="text-slate-400">Regular:</span>
                                     <span className="text-slate-500 line-through">₹{product.originalPrice}</span>
                                     <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Save {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% (₹{(product.originalPrice - product.price).toFixed(0)})</span>
                                   </div>
                                 )}

                                 <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                   <div className="flex flex-col">
                                     <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Global Discount</span>
                                     <span className="text-[10px] text-slate-500">{product.apply_discount === 1 ? "Enabled for this product" : "Disabled (Original Price)"}</span>
                                   </div>
                                   <label className="relative inline-flex items-center cursor-pointer">
                                     <input 
                                       type="checkbox" 
                                       className="sr-only peer" 
                                       checked={product.apply_discount === 1}
                                       onChange={() => toggleApplyDiscount(product)}
                                     />
                                     <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                   </label>
                                 </div>
                                 
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
                  
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      
                      {/* Tabs */}
                      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 backdrop-blur-sm shrink-0 w-full lg:w-auto overflow-x-auto">
                        <button onClick={() => setOrderFilterSource("All")} className={`whitespace-nowrap flex-1 lg:flex-none py-2 px-5 rounded-xl font-bold text-sm transition-all duration-300 ${orderFilterSource === "All" ? "bg-white text-indigo-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}>All Orders</button>
                        <button onClick={() => setOrderFilterSource("Website")} className={`whitespace-nowrap flex-1 lg:flex-none py-2 px-5 rounded-xl font-bold text-sm transition-all duration-300 ${orderFilterSource === "Website" ? "bg-white text-indigo-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}>🌐 Website</button>
                        <button onClick={() => setOrderFilterSource("POS")} className={`whitespace-nowrap flex-1 lg:flex-none py-2 px-5 rounded-xl font-bold text-sm transition-all duration-300 ${orderFilterSource === "POS" ? "bg-white text-indigo-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}>🖥️ POS</button>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64 group">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            placeholder="Search ID, Name..."
                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                          />
                        </div>

                        {/* Payment Filter */}
                        <div className="relative w-full sm:w-auto">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-500 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" /><path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" /></svg>
                          </span>
                          <select
                            value={orderPaymentFilter}
                            onChange={(e) => setOrderPaymentFilter(e.target.value)}
                            className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                          >
                            <option value="All">Payment: All</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg></div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative w-full sm:w-auto">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-blue-500 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
                          </span>
                          <select
                            value={orderStatusFilter}
                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                            className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                          >
                            <option value="All">Status: All</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg></div>
                        </div>

                      </div>
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
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Payment</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {filteredOrders.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="py-20 text-center">
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
                                          #{String(order.id).padStart(4, '0')}
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
                                      <td className="px-6 py-5 relative">
                                        <div className="flex items-center gap-2">
                                          <select
                                            disabled={updatingStatusForId === order.id}
                                            value={order.payment_status || 'Unpaid'}
                                            onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                                            className={`text-sm font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-colors shadow-sm
                                              ${(!order.payment_status || order.payment_status === 'Unpaid') ? 'bg-red-50 text-red-600 border-red-200 focus:ring-red-500/20' : 
                                                'bg-emerald-50 text-emerald-600 border-emerald-200 focus:ring-emerald-500/20'
                                              } ${updatingStatusForId === order.id ? 'opacity-50' : ''}`}
                                          >
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Paid">Paid</option>
                                          </select>
                                          {updatingStatusForId === order.id && (
                                            <div className="flex justify-center">
                                              <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-5 relative">
                                        <div className="flex items-center gap-2">
                                          <select
                                            disabled={updatingStatusForId === order.id}
                                            value={order.status || 'Pending'}
                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                            className={`text-sm font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-colors shadow-sm
                                              ${(!order.status || order.status === 'Pending') ? 'bg-amber-50 text-amber-600 border-amber-200 focus:ring-amber-500/20' : 
                                                order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 focus:ring-emerald-500/20' :
                                                order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-200 focus:ring-blue-500/20' :
                                                order.status === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-200 focus:ring-purple-500/20' :
                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200 focus:ring-red-500/20' :
                                                'bg-slate-50 text-slate-600 border-slate-200 focus:ring-slate-500/20'
                                              } ${updatingStatusForId === order.id ? 'opacity-50' : ''}`}
                                          >
                                            {(!order.status || order.status === 'Pending') && (
                                              <>
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                              </>
                                            )}
                                            {order.status === 'Processing' && (
                                              <>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Completed">Completed</option>
                                              </>
                                            )}
                                            {order.status === 'Shipped' && (
                                              <>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Completed">Completed</option>
                                              </>
                                            )}
                                            {order.status === 'Completed' && (
                                              <option value="Completed">Completed</option>
                                            )}
                                            {order.status === 'Cancelled' && (
                                              <option value="Cancelled">Cancelled</option>
                                            )}
                                          </select>
                                          {updatingStatusForId === order.id && (
                                            <div className="flex justify-center">
                                              <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                            </div>
                                          )}
                                        </div>
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
                  
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10 mb-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search customers by name or phone..." 
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setCustomersPage(1);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none shadow-sm"
                      />
                    </div>
                    
                    <button onClick={() => downloadExcel()} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors whitespace-nowrap shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export to Excel
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-16 text-center">
                        <div className="text-6xl mb-4 opacity-50">👥</div>
                        <h3 className="text-lg font-bold text-slate-900">{uniqueCustomers.length === 0 ? "Customer Directory" : "No customers found"}</h3>
                        <p className="text-slate-500 text-base mt-2">{uniqueCustomers.length === 0 ? "The customer directory is automatically populated from order history." : "Try adjusting your search filter."}</p>
                      </div>
                    ) : (
                      (() => {
                        const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
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
                                  {filteredCustomers.slice((customersPage - 1) * itemsPerPage, customersPage * itemsPerPage).map((customer, index) => (
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
                                        <div className="font-black text-slate-900 text-base mb-1">₹{customer.totalSpent.toFixed(2)}</div>
                                        <div className="mt-1.5">
                                          {customer.totalUnpaid > 0 ? (
                                            <div className="inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-wider w-fit shadow-sm">
                                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></span> Unpaid
                                            </div>
                                          ) : (
                                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-wider w-fit shadow-sm">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span> Paid
                                            </div>
                                          )}
                                        </div>
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
                            {filteredCustomers.length > itemsPerPage && (
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
                    <style type="text/css" media="print">{`
                      @page { size: auto; margin: 0mm; }
                      body { padding: 10mm; background-color: #ffffff; }
                    `}</style>
                    {/* Print Only Header */}
                    <div className="hidden print:block mb-6">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #2a0845 0%, #4a1c6a 100%)', padding: '25px 30px', borderBottom: '4px solid #f59e0b', borderRadius: '12px 12px 0 0', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        
                        {/* Left: Logo & Core Info */}
                        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
                          <div style={{ marginRight: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden' }}>
                            <img src="/assets/images/vamsi_crackers_logo_v2.png" alt="Vamsi Crackers" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'drop-shadow(0px 2px 8px rgba(255,255,255,0.2))', transform: 'scale(1.15)' }} />
                          </div>
                          
                          <div>
                            <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '2px', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                              <span style={{ color: '#ffffff' }}>VAMSI</span> <span style={{ color: '#fbbf24' }}>CRACKERS</span>
                            </h1>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px', letterSpacing: '0.5px' }}>
                              PROPRIETOR: <span style={{ color: '#ffffff' }}>SWETHA</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#e2e8f0', maxWidth: '350px', lineHeight: 1.5, fontWeight: 500 }}>
                              D.NO. 177/5/18, Pernaickenpatti,<br/>Sithurajapuram, Virudhunagar, Tamil Nadu 626 189, India
                            </div>
                          </div>
                        </div>

                        {/* Right: Contact Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1, alignItems: 'flex-end', fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>📱</span> +91 90800 19031
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>✉️</span> vamsidharuncrackers@gmail.com
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>🌐</span> <span style={{ color: '#fbbf24', textDecoration: 'underline', fontWeight: 'bold' }}>www.vamsicrackers.in</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest" style={{ textDecoration: 'underline' }}>Sales Report</h1>
                        <p className="text-slate-500 mt-2 font-bold">
                          {reportType === 'date' ? 'Day' : reportType === 'month' ? 'Month' : 'Year'} Breakdown
                        </p>
                      </div>
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
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-shrink-0">
                      <div className="relative flex-1 group">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                          </svg>
                        </span>
                        <input type="text" placeholder="Search product to bill..." value={billingSearch} onChange={e => setBillingSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400" />
                      </div>
                      
                      <div className="relative w-full sm:w-56 group">
                         <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                            </svg>
                         </span>
                        <select value={billingCategoryFilter} onChange={e => setBillingCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                          <option value="All">All Categories</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg></div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          {products.filter(p => p.name.toLowerCase().includes(billingSearch.toLowerCase()) && (billingCategoryFilter === "All" || p.categoryId.toString() === billingCategoryFilter)).map(product => {
                            const isAdded = billingCart.some(i => i.id === product.id);
                            return (
                              <div key={product.id} onClick={() => {
                                 if(isAdded) {
                                   showToast("Product is already added. Increase quantity in the cart.", "error");
                                 } else {
                                   setBillingCart([...billingCart, {...product, quantity: 1}]);
                                 }
                              }} className={`border rounded-2xl p-4 transition-all flex flex-col items-center text-center group relative overflow-hidden ${isAdded ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30 cursor-pointer'}`}>
                                 {isAdded && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-sm tracking-widest uppercase flex items-center gap-1 z-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg> IN CART</div>}
                                 {product.originalPrice > product.price && (
                                   <div className={`absolute top-3 left-3 text-[9px] font-black px-2 py-1 rounded-md shadow-sm tracking-widest z-10 ${isAdded ? 'bg-slate-300 text-slate-600' : 'bg-rose-500 text-white'}`}>
                                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                   </div>
                                 )}
                                 {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" className={`h-28 w-full object-contain mb-3 transition-transform relative z-0 ${isAdded ? 'grayscale' : 'group-hover:scale-105'}`} /> : <div className={`h-28 text-5xl flex items-center justify-center mb-3 transition-transform relative z-0 ${isAdded ? 'opacity-30 grayscale' : 'opacity-50 group-hover:scale-110'}`}>📦</div>}
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md mb-2">{categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}</span>
                                 <h4 className={`text-sm font-bold line-clamp-2 leading-snug mb-3 ${isAdded ? 'text-slate-500' : 'text-slate-800'}`}>{product.name}</h4>
                                 
                                 <div className="mt-auto flex items-center justify-center gap-2">
                                   <span className={`text-lg font-black px-3 py-1 rounded-lg ${isAdded ? 'text-slate-400 bg-slate-200/50' : 'text-indigo-600 bg-indigo-50'}`}>₹{product.price}</span>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                  
                  {/* Right: Cart & Billing */}
                    <div className="w-full lg:w-[450px] flex flex-col bg-slate-900 border border-slate-700 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden min-h-0 shrink-0">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                      <h3 className="text-xl font-black text-white tracking-tight mb-5 flex items-center justify-between border-b border-slate-700/50 pb-4 shrink-0 relative z-10">
                        <span>Current Bill</span>
                        <div className="flex items-center gap-4">
                          {billingCart.length > 0 && (
                            <button 
                              onClick={() => {
                                setBillingCart([]);
                                setBillingCustomer({ name: '', phone: '', email: '', city: '', address: '' });
                                setAdditionalDiscountValue('');
                                setPackingCharge('');
                                setAdditionalDiscountType('amount');
                                showToast("Bill cleared completely", "success");
                              }}
                              className="text-[10px] text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1.5 rounded-lg uppercase tracking-widest font-black transition-colors flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                              Clear
                            </button>
                          )}
                          <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner">{billingCart.reduce((a, c) => a + c.quantity, 0)} Items</span>
                        </div>
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
                                <input 
                                  type="number" 
                                  min="1" 
                                  value={item.quantity === 0 ? '' : item.quantity} 
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 1) {
                                      setBillingCart(billingCart.map(i => i.id === item.id ? { ...i, quantity: val } : i));
                                    }
                                  }}
                                  className="w-10 bg-transparent text-xs font-black text-white text-center outline-none focus:bg-slate-800 rounded px-0 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
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

                        <div className="mt-4 pt-4 border-t border-slate-700/50 shrink-0 relative z-10">
                          <div className="mb-3">
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="Name *" value={billingCustomer.name} onChange={(e) => setBillingCustomer({...billingCustomer, name: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500" />
                              <input type="text" placeholder="Phone *" value={billingCustomer.phone} onChange={(e) => setBillingCustomer({...billingCustomer, phone: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500" />
                              <input type="text" placeholder="City *" value={billingCustomer.city} onChange={(e) => setBillingCustomer({...billingCustomer, city: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500" />
                              <input type="text" placeholder="Address" value={billingCustomer.address} onChange={(e) => setBillingCustomer({...billingCustomer, address: e.target.value})} className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500" />
                            </div>
                          </div>

                          {(() => {
                            const subtotal = billingCart.reduce((a, c) => a + (c.originalPrice * c.quantity), 0);
                            const total = billingCart.reduce((a, c) => a + (c.price * c.quantity), 0);
                            
                            const extraVal = Number(additionalDiscountValue || 0);
                            const extraAmt = additionalDiscountType === "percentage" ? (total * extraVal) / 100 : extraVal;
                            const packChg = Number(packingCharge || 0);
                            
                            const finalTotal = Math.max(0, total - extraAmt + packChg);
                            const finalSavings = (subtotal - total) + extraAmt;
                            
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-2 mb-3 border-b border-slate-700/50 pb-3">
                                  {/* Addl. Discount */}
                                  <div className="flex bg-slate-800/80 border border-slate-700 rounded-lg focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all items-center pl-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                                    <div className="relative flex items-center ml-1">
                                      <select 
                                        value={additionalDiscountType} 
                                        onChange={(e) => setAdditionalDiscountType(e.target.value as "amount"|"percentage")}
                                        className="bg-transparent hover:bg-slate-700/50 text-slate-300 font-bold text-[11px] rounded pl-2 pr-4 py-1 outline-none cursor-pointer appearance-none transition-colors"
                                      >
                                        <option value="amount">₹ Amt</option>
                                        <option value="percentage">% Pct</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                                      </div>
                                    </div>
                                    <div className="w-px h-3.5 bg-slate-700 mx-1"></div>
                                    <input 
                                      type="number" 
                                      min="0"
                                      placeholder="Discount"
                                      value={additionalDiscountValue}
                                      onChange={(e) => setAdditionalDiscountValue(e.target.value)}
                                      className="w-full bg-transparent text-white font-bold text-xs px-2 py-1.5 outline-none placeholder:text-slate-600 placeholder:font-medium"
                                    />
                                  </div>
                                  
                                  {/* Packing Charges */}
                                  <div className="flex bg-slate-800/80 border border-slate-700 rounded-lg focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all items-center pl-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"><path fillRule="evenodd" d="M11.986 3H12a2 2 0 0 1 2 2v6a2 2 0 0 1-1.5 1.937V7A2.5 2.5 0 0 0 10 4.5H4.063A2 2 0 0 1 6 3h.014A2.25 2.25 0 0 1 8.25 1h3.5a2.25 2.25 0 0 1 2.236 2ZM10.5 4v-.75a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75V4h5Z" clipRule="evenodd" /><path fillRule="evenodd" d="M3 6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3Zm6 8.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3Z" clipRule="evenodd" /></svg>
                                    <span className="text-slate-400 font-bold text-xs pl-1.5 pr-1 py-1.5">₹</span>
                                    <div className="w-px h-3.5 bg-slate-700 mx-1"></div>
                                    <input 
                                      type="number" 
                                      min="0"
                                      placeholder="Packing"
                                      value={packingCharge}
                                      onChange={(e) => setPackingCharge(e.target.value)}
                                      className="w-full bg-transparent text-white font-bold text-xs px-2 py-1.5 outline-none placeholder:text-slate-600 placeholder:font-medium"
                                    />
                                  </div>
                                </div>
                              
                              <div className="flex justify-between items-end mb-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                                <div>
                                  <div className="text-[10px] text-slate-400 tracking-widest font-black uppercase mb-1">Total Amount</div>
                                  <div className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-md inline-block">
                                    Save ₹{finalSavings.toFixed(0)} ({subtotal > 0 ? Math.round((finalSavings / subtotal) * 100) : 0}% OFF)
                                  </div>
                                </div>
                                <div className="text-2xl font-black text-white tracking-tight">₹{finalTotal.toFixed(2)}</div>
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
                                      total_amount: finalTotal,
                                      total_savings: finalSavings,
                                      source: "POS",
                                      status: "Completed",
                                      payment_status: "Paid",
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

              {activeTab === "banner" && (
                <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fadeIn overflow-y-auto h-full pb-32">
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="text-3xl">🖼️</span> Scrolling Banner
                      </h2>
                      <p className="text-indigo-200 text-base mt-2 font-medium max-w-xl">
                        Update the scrolling banner images that appear on the customer website.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Image Banners */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Scrolling Image Banners</h3>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="bannerImageUpload"
                            className="hidden"
                            onChange={handleBannerImageUpload}
                            disabled={isUploadingBanner}
                          />
                          <label
                            htmlFor="bannerImageUpload"
                            className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2"
                          >
                            {isUploadingBanner ? (
                              <span className="animate-spin text-xl">⏳</span>
                            ) : (
                              <span className="text-xl">📤</span>
                            )}
                            Upload Banner Image
                          </label>
                        </div>
                      </div>

                      {bannerImages.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/50">
                          <span className="text-4xl block mb-3 opacity-50">🖼️</span>
                          <p className="text-slate-300 font-semibold text-lg">No banner images uploaded yet.</p>
                          <p className="text-slate-500 text-sm mt-1">Upload images to display on the customer portal carousel.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {bannerImages.map((imgUrl, idx) => (
                            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-900 aspect-video md:aspect-[21/9]">
                              {/* Image */}
                              <img 
                                src={imgUrl} 
                                alt={`Banner ${idx + 1}`} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
                              />
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                              
                              {/* Content Overlay */}
                              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white font-bold text-xs uppercase tracking-widest shadow-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Slide {idx + 1}
                                  </span>
                                  
                                  <button
                                    onClick={() => handleRemoveBannerImage(idx)}
                                    className="w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-110 transition-all duration-300 backdrop-blur-md border border-red-400/50 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
                                    title="Remove Banner"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                  </div>
                </div>
              )}

              {/* FALLBACK FOR NEW DYNAMIC MODULES */}
              {!["overview", "categories", "products", "orders", "customers", "reports", "billing", "contacts", "banner"].includes(activeTab) && (
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
          <div className="bg-slate-800 border border-blue-500/30 rounded-[2rem] w-full max-w-5xl shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden animate-slideDown my-8 relative flex flex-col max-h-[95vh]">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-transparent px-8 py-6 border-b border-slate-700 flex justify-between items-center relative z-10 shrink-0">
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
            <form onSubmit={handleProductSubmit} className="relative z-10 flex-1 flex flex-col overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-10 p-8 overflow-y-auto custom-scrollbar">
                {/* Left Column: Product Details */}
                <div className="flex-[3] space-y-8">
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

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={productSortOrder}
                    onChange={(e) => setProductSortOrder(e.target.value)}
                    placeholder="e.g. 1 (Default is 0)"
                    className="w-full bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl py-3.5 px-5 text-base font-semibold text-white outline-none transition-all placeholder-slate-500 shadow-inner"
                  />
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

                <div className="flex items-center justify-between col-span-1 md:col-span-2 bg-slate-700/30 p-5 rounded-2xl border border-slate-600/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-amber-300 uppercase tracking-wide">Opt-in to Global Discount</span>
                    <span className="text-xs text-slate-400 mt-1 font-medium">When enabled, any Global Discount will automatically update this product&apos;s Offer Price.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={Boolean(productApplyDiscount)}
                      onChange={(e) => setProductApplyDiscount(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between col-span-1 md:col-span-2 bg-slate-700/30 p-5 rounded-2xl border border-slate-600/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Product Status: {productIsActive ? "ACTIVE" : "INACTIVE"}</span>
                    <span className="text-xs text-slate-400 mt-1 font-medium">When inactive, this product will be hidden from the customer portal.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={Boolean(productIsActive)}
                      onChange={(e) => setProductIsActive(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Image Upload (Moved to Left Column) */}
              <div className="space-y-4 pt-6 border-t border-slate-700/50 mt-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                  <span className="w-5 h-5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">🖼️</span>
                  Product Image Upload
                </label>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 bg-slate-700/30 rounded-2xl p-4 border border-slate-600 flex flex-col justify-center items-center text-center gap-3 relative overflow-hidden group min-h-[160px]">
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
                  
                  <div className="flex-1 flex flex-col justify-center">
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
                      className="w-full py-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-base font-bold tracking-tight transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-inner"
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
              </div>
            </div>
            
            {/* Right Column: Image Selection (Presets) */}
            <div className="flex-[2] border-t lg:border-t-0 lg:border-l border-slate-700/50 pt-8 lg:pt-0 lg:pl-10">
              <div className="bg-slate-700/30 rounded-2xl p-5 border border-slate-600 h-full flex flex-col">
                <span className="text-xs font-black tracking-widest uppercase text-slate-400 mb-6 block flex items-center gap-2">
                  <span>✨</span> Choose from Presets
                </span>
                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
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
                      <div className="w-10 h-10 relative">
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
              <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-700 bg-slate-800/80 shrink-0">
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
            
            <div className="bg-slate-800 border border-amber-500/30 rounded-[2rem] w-full max-w-4xl shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden animate-slideDown relative flex flex-col md:flex-row">
              
              {/* Left Side: Information */}
              <div className="md:w-5/12 bg-gradient-to-br from-amber-900/40 to-slate-900 p-8 border-r border-slate-700/50 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl shadow-inner mb-6">
                    🏷️
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-4">
                    Global Discount
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium mb-6">
                    Set a flat discount percentage for your entire catalog. This will recalculate the offer price for <strong className="text-amber-400">all eligible products</strong> based on their original price instantly.
                  </p>
                  
                  <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-400 text-lg mt-0.5">💡</span>
                      <p className="text-xs text-amber-100/70 font-medium leading-relaxed">
                        Products with the discount toggle disabled in the products list will <strong className="text-amber-400">not</strong> be affected by this change.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Controls */}
              <div className="md:w-7/12 p-8 relative flex flex-col justify-between bg-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGlobalDiscountModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center text-lg backdrop-blur-sm z-20"
                >
                  ✕
                </button>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pt-8 md:pt-0">
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-500 mb-6 text-center">
                    Set Discount Percentage
                  </label>
                  
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => {
                        const val = parseInt(globalDiscountValue) || 0;
                        if (val > 0) setGlobalDiscountValue(String(val - 5));
                      }}
                      className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-black text-2xl hover:bg-slate-700 hover:text-amber-400 hover:border-amber-400/50 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                    >−</button>
                    
                    <div className="relative group">
                      <div className="relative flex items-center justify-center bg-slate-950 border-2 border-amber-500/50 rounded-2xl w-36 h-24 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={globalDiscountValue}
                          onChange={(e) => setGlobalDiscountValue(e.target.value)}
                          className="w-full h-full bg-transparent text-center text-5xl font-black text-amber-400 outline-none appearance-none"
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <span className="absolute right-3 bottom-3 text-amber-500/70 font-black text-lg">%</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const val = parseInt(globalDiscountValue) || 0;
                        if (val < 100) setGlobalDiscountValue(String(val + 5));
                      }}
                      className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-black text-2xl hover:bg-slate-700 hover:text-amber-400 hover:border-amber-400/50 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                    >+</button>
                  </div>
                  
                  {/* Visualizer text */}
                  <div className="mt-10 text-center">
                    <span className="inline-flex items-center gap-3 bg-slate-900/50 border border-slate-700 px-5 py-3 rounded-xl text-sm text-slate-400 font-medium tracking-wide shadow-inner">
                      <span>A ₹1000 product will become</span>
                      <span className="text-amber-400 font-black text-base bg-amber-400/10 px-3 py-1 rounded-lg">₹{1000 - (1000 * (parseInt(globalDiscountValue) || 0) / 100)}</span>
                    </span>
                  </div>
                </div>

              {/* Modal Footer (now part of right side) */}
              <div className="mt-8 pt-6 border-t border-slate-700 flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setShowGlobalDiscountModal(false)}
                  disabled={isApplyingDiscount}
                  className="flex-1 py-4 rounded-xl bg-slate-700/50 border border-slate-600 hover:bg-slate-700 text-sm font-bold tracking-tight text-slate-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyGlobalDiscount}
                  disabled={isApplyingDiscount}
                  className="flex-[2] py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-sm tracking-tight transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isApplyingDiscount ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        </div>
      )}

      {/* ORDER ITEMS VIEW MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-[95vw] max-w-7xl overflow-hidden shadow-2xl animate-slideDown my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-indigo-50/50 px-8 py-6 border-b border-indigo-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-indigo-950 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-500 text-xl">🛍️</div>
                  Order #{String(viewingOrder.id).padStart(4, '0')} Details
                </h3>
                <p className="text-slate-500 text-base font-medium mt-2 tracking-tight flex items-center gap-2">
                  <span>Customer: <span className="text-indigo-700 font-black">{viewingOrder.customer_name}</span></span>
                  <span className="text-slate-300">|</span>
                  <span>Total Items: <span className="text-indigo-700 font-black">{viewingOrder.items.length}</span></span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-2">
                    Payment: 
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${(!viewingOrder.payment_status || viewingOrder.payment_status === 'Unpaid') ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                      {viewingOrder.payment_status || 'Unpaid'}
                    </span>
                  </span>
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Items List */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow space-y-6 relative bg-slate-50/50">
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-black tracking-tight transition-all shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 flex items-center gap-2 active:scale-[0.98]"
                >
                  <div className="bg-white/20 p-1 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  Add Extra Products
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-sm font-black uppercase tracking-widest">
                      <th className="py-5 px-6">Particulars</th>
                      <th className="py-5 px-6 text-center">Qty</th>
                      <th className="py-5 px-6 text-right">Rate</th>
                      <th className="py-5 px-6 text-center">Unit</th>
                      <th className="py-5 px-6 text-right text-slate-900">Amount</th>
                      <th className="py-5 px-6 text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-lg">
                    {viewingOrder.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="py-5 px-6 text-slate-800 font-bold">{item.name}</td>
                        <td className="py-5 px-6 text-center">
                          <span className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 border border-indigo-100 shadow-sm font-black inline-block min-w-[3rem] text-center">{item.quantity}</span>
                        </td>
                        <td className="py-5 px-6 text-right text-slate-500 font-medium">
                          ₹{item.originalPrice}
                        </td>
                        <td className="py-5 px-6 text-center text-slate-500 font-bold">BOX</td>
                        <td className="py-5 px-6 text-right text-slate-900 font-black">₹{item.originalPrice * item.quantity}</td>
                        <td className="py-5 px-6 text-center">
                          <button
                            onClick={() => handleRemoveProductFromOrder(idx)}
                            className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Remove Product"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="py-5 px-6 text-right text-base font-bold tracking-tight text-slate-500">Total Amount:</td>
                      <td className="py-5 px-6 text-right text-xl font-black text-slate-900">₹{viewingOrder.total_amount + (viewingOrder.total_savings || 0)}</td>
                    </tr>
                    {(viewingOrder.total_savings || 0) > 0 && (
                      <tr className="border-t border-slate-200">
                        <td colSpan={4} className="py-4 px-6 text-right text-sm font-bold tracking-tight text-emerald-600">
                          Discount Applied ({Math.round(((viewingOrder.total_savings || 0) / (viewingOrder.total_amount + (viewingOrder.total_savings || 0))) * 100)}% OFF):
                        </td>
                        <td className="py-4 px-6 text-right text-lg font-black text-emerald-600">-₹{viewingOrder.total_savings || 0}</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={3} className="py-4 px-6 border-r border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg> Addl. Discount:</span>
                          <div className="relative">
                            <select 
                              value={additionalDiscountType} 
                              onChange={(e) => setAdditionalDiscountType(e.target.value as "amount"|"percentage")}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl pl-4 pr-9 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all cursor-pointer appearance-none"
                            >
                              <option value="amount">Amount (₹)</option>
                              <option value="percentage">Percentage (%)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                            </div>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              min="0"
                              placeholder="Value"
                              value={additionalDiscountValue}
                              onChange={(e) => setAdditionalDiscountValue(e.target.value)}
                              className="w-28 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-medium"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right text-base font-bold tracking-tight text-slate-500">Additional Discount:</td>
                      <td className="py-4 px-6 text-right text-lg font-black text-emerald-600">
                        -₹{(() => {
                           const extraVal = Number(additionalDiscountValue || 0);
                           if(extraVal === 0) return "0";
                           return additionalDiscountType === "percentage" 
                             ? ((viewingOrder.total_amount * extraVal) / 100).toFixed(2) 
                             : extraVal.toFixed(2);
                        })()}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={3} className="py-4 px-6 border-r border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500"><path fillRule="evenodd" d="M11.986 3H12a2 2 0 0 1 2 2v6a2 2 0 0 1-1.5 1.937V7A2.5 2.5 0 0 0 10 4.5H4.063A2 2 0 0 1 6 3h.014A2.25 2.25 0 0 1 8.25 1h3.5a2.25 2.25 0 0 1 2.236 2ZM10.5 4v-.75a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75V4h5Z" clipRule="evenodd" /><path fillRule="evenodd" d="M3 6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3Zm6 8.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3Z" clipRule="evenodd" /></svg> Packing Charges:</span>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">₹</span>
                            <input 
                              type="number" 
                              min="0"
                              placeholder="0.00"
                              value={packingCharge}
                              onChange={(e) => setPackingCharge(e.target.value)}
                              className="w-32 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-medium"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right text-base font-bold tracking-tight text-slate-500">Packing Charges:</td>
                      <td className="py-4 px-6 text-right text-lg font-black text-slate-900">
                        +₹{Number(packingCharge || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-indigo-200 bg-indigo-50">
                      <td colSpan={4} className="py-6 px-6 text-right text-lg font-black tracking-tight text-indigo-900">Final Amount To Pay:</td>
                      <td className="py-6 px-6 text-right text-3xl font-black text-indigo-700">
                        ₹{(() => {
                           const extraVal = Number(additionalDiscountValue || 0);
                           const extraAmt = additionalDiscountType === "percentage" 
                             ? (viewingOrder.total_amount * extraVal) / 100 
                             : extraVal;
                           const packChg = Number(packingCharge || 0);
                           return Math.max(0, viewingOrder.total_amount - extraAmt + packChg).toFixed(2);
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 flex justify-end gap-4 shrink-0">
              <button
                onClick={() => handleWhatsAppShare(viewingOrder, additionalDiscountType, additionalDiscountValue, packingCharge)}
                className="hidden px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-black tracking-tight transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 border border-green-400/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.2 0-.4 0-.5C10 9.5 9.4 8 9.3 7.4c-.1-.5-.2-.5-.4-.5h-.5c-.2 0-.5.1-.8.4-.3.3-1.2 1.2-1.2 3 0 1.8 1.2 3.5 1.4 3.7.2.2 2.5 3.9 6.1 5.4 1.4.6 2.4.9 3.2 1.2.8.3 1.6.3 2.2.2.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.2-.3-.5-.4zM12 20.1h-.1c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.3.9.9-3.2-.2-.3c-.9-1.4-1.4-3-1.4-4.7 0-4.9 4-8.9 8.9-8.9 2.4 0 4.6.9 6.3 2.6 1.7 1.7 2.6 3.9 2.6 6.3 0 4.9-4 8.9-8.9 8.9zm0-16.7c-4.3 0-7.8 3.5-7.8 7.8 0 1.4.4 2.8 1.1 4l.3.5-.8 3 3.1-.8.5.3c1.2.7 2.6 1.1 4 1.1 4.3 0 7.8-3.5 7.8-7.8 0-2.1-.8-4-2.3-5.5-1.5-1.5-3.5-2.3-5.6-2.3z" />
                </svg>
                Share on WhatsApp
              </button>
              <button
                onClick={() => handlePrintOrder(viewingOrder, additionalDiscountType, additionalDiscountValue, packingCharge)}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-base font-black tracking-tight transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 border border-indigo-400/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0v-2.94a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.94ZM15 10.125a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Z" />
                </svg>
                Print / Download PDF
              </button>
              <button
                onClick={() => { setViewingOrder(null); setAdditionalDiscountValue(""); setPackingCharge(""); setStagedProducts([{productId: "", qty: "1"}]); }}
                className="px-8 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-base font-black tracking-tight text-slate-700 transition-all shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXTRA PRODUCTS MODAL */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsAddProductModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-slideDown flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Extra Products to Order
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow space-y-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setStagedProducts([...stagedProducts, {productId: "", qty: "1"}])}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors flex items-center gap-1"
                >
                  + Add Row
                </button>
              </div>
              <div className="space-y-3">
                {stagedProducts.map((sp, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <select
                      value={sp.productId}
                      onChange={(e) => {
                        const newStaged = [...stagedProducts];
                        newStaged[index].productId = e.target.value;
                        setStagedProducts(newStaged);
                      }}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                    >
                      <option value="">Select a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-500">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={sp.qty}
                        onChange={(e) => {
                          const newStaged = [...stagedProducts];
                          newStaged[index].qty = e.target.value;
                          setStagedProducts(newStaged);
                        }}
                        className="w-24 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                      />
                    </div>
                    {stagedProducts.length > 1 && (
                      <button
                        onClick={() => setStagedProducts(stagedProducts.filter((_, i) => i !== index))}
                        className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Remove row"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-black tracking-tight transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProductToOrder}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black tracking-tight transition-all shadow-sm flex items-center gap-2"
              >
                Add Selected to Order
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
