import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Edit, Trash2, Package, ShoppingCart, DollarSign,
  Calendar, Filter, Star, Clock, MapPin, Users as UsersIcon, Eye
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';
import StatCard from './components/StatCard';

const API_ORIGIN = 'http://212.38.94.189:8000';

// ✅ ENHANCED OrderDetailsModal Component with FIXED Pricing Calculation
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(parseFloat(amount) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'out_for_delivery': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // ✅ FIXED: Function to get the correct effective price (sale price if available, otherwise regular price)
  const getEffectivePrice = (product) => {
    return product.sale_price && parseFloat(product.sale_price) > 0 
      ? parseFloat(product.sale_price) 
      : parseFloat(product.unit_price || product.price || 0);
  };

  // ✅ FIXED: Function to calculate total price correctly
  const calculateTotalPrice = (product) => {
    const effectivePrice = getEffectivePrice(product);
    const quantity = parseInt(product.quantity) || 1;
    return effectivePrice * quantity;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Order ID:</span> #{order.id}</p>
                <p><span className="font-medium">Order Number:</span> {order.order_number || 'N/A'}</p>
                <p><span className="font-medium">Date:</span> {formatDate(order.created_at)}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
                  </span>
                </p>
                <p><span className="font-medium">Payment Method:</span> 
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {order.payment_method || 'COD'}
                  </span>
                </p>
                <p><span className="font-medium">Payment Status:</span> 
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {order.payment_status || 'Pending'}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.user?.name || 'Unknown Customer'}</p>
                <p><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {order.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED Delivery Address Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {order.address ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-gray-900 capitalize">{order.address.type} Address</p>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      ID: {order.address.id}
                    </span>
                  </div>
                  
                  {/* Full Address with Icon */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">Complete Address:</p>
                        <p className="text-gray-700 mt-1">{order.address.full_address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3 ml-6">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Area: <strong>{order.address.area}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>City: <strong>{order.address.city}</strong></span>
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">Address not available</p>
              )}
            </div>
          </div>

          {/* ✅ FIXED Order Items with Correct Pricing Calculation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.products?.map((product, index) => {
                const effectivePrice = getEffectivePrice(product);
                const totalPrice = calculateTotalPrice(product);
                const hasDiscount = product.sale_price && parseFloat(product.sale_price) > 0 && parseFloat(product.sale_price) < parseFloat(product.unit_price || product.price || 0);

                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.image || '/api/placeholder/60/60'}
                        alt={product.name}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.description}</p>
                        
                        {/* ✅ FIXED: Show pricing with discount information */}
                        <div className="text-sm text-gray-600 mt-1">
                          <span>Quantity: {product.quantity} × </span>
                          {hasDiscount ? (
                            <span className="space-x-2">
                              <span className="text-green-600 font-semibold">{formatCurrency(effectivePrice)}</span>
                              <span className="line-through text-gray-400">{formatCurrency(product.unit_price || product.price)}</span>
                              <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">SALE</span>
                            </span>
                          ) : (
                            <span className="font-semibold">{formatCurrency(effectivePrice)}</span>
                          )}
                        </div>

                        {product.spice_level && (
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            product.spice_level === 'hot' ? 'bg-red-100 text-red-800' :
                            product.spice_level === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.spice_level}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {/* ✅ FIXED: Show correct total price */}
                      <p className="font-semibold text-lg">{formatCurrency(totalPrice)}</p>
                      {hasDiscount && (
                        <div className="text-xs text-gray-500">
                          <span className="line-through">{formatCurrency((parseFloat(product.unit_price || product.price) * parseInt(product.quantity)))}</span>
                          <span className="text-green-600 ml-1">
                            Save {formatCurrency((parseFloat(product.unit_price || product.price) - effectivePrice) * parseInt(product.quantity))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ FIXED Order Summary with Corrected Calculations */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {/* Calculate subtotal from actual product prices */}
              {(() => {
                const calculatedSubtotal = order.products?.reduce((sum, product) => {
                  return sum + calculateTotalPrice(product);
                }, 0) || 0;

                const originalTotal = order.products?.reduce((sum, product) => {
                  const originalPrice = parseFloat(product.unit_price || product.price || 0);
                  const quantity = parseInt(product.quantity) || 1;
                  return sum + (originalPrice * quantity);
                }, 0) || 0;

                const totalSavings = originalTotal - calculatedSubtotal;

                return (
                  <>
                    {/* Show original total if there are discounts */}
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Original Total:</span>
                        <span className="line-through">{formatCurrency(originalTotal)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculatedSubtotal)}</span>
                    </div>

                    {/* Show total discount if applicable */}
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Total Discount:</span>
                        <span>-{formatCurrency(totalSavings)}</span>
                      </div>
                    )}

                    {/* Additional discounts from coupons etc */}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Additional Discount:</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total_amount || calculatedSubtotal - (order.discount || 0))}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Additional Information */}
          {(order.coupon_code || order.special_instructions) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="space-y-2">
                {order.coupon_code && (
                  <p><span className="font-medium">Coupon Used:</span> {order.coupon_code}</p>
                )}
                {order.special_instructions && (
                  <div>
                    <span className="font-medium">Special Instructions:</span>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg mt-1">
                      {order.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {(order.estimated_delivery_time || order.delivered_at) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Information</h3>
              <div className="space-y-2">
                {order.estimated_delivery_time && (
                  <p><span className="font-medium">Estimated Delivery:</span> {formatDate(order.estimated_delivery_time)}</p>
                )}
                {order.delivered_at && (
                  <p><span className="font-medium">Delivered At:</span> {formatDate(order.delivered_at)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Data state
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  // Orders state with pagination
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearchTerm, setOrdersSearchTerm] = useState('');

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '+1234567890', orders: 15, status: 'Active', joined: '2024-01-15', totalSpent: 234.50, lastOrder: '2024-08-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '+1234567891', orders: 8, status: 'Active', joined: '2024-02-20', totalSpent: 167.80, lastOrder: '2024-08-14' },
  ]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_ORIGIN}/api/home-filters`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        console.log(data);
        
        setCategories(Array.isArray(data) ? data : (data.categories || []));
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch paginated products with search
  const fetchProducts = useCallback(async (page = 1, search = '', perPage = 10) => {
    try {
      const url = new URL(`${API_ORIGIN}/api/admin/getproducts`);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      if (search) url.searchParams.append('search', search);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      if (data.status) {
        setProducts(data.data || []);
        setPagination(data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        });
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setProducts([]);
    }
  }, []);

  // Fetch orders with pagination and search
  const fetchOrders = useCallback(async (page = 1, search = '', perPage = 20) => {
    setOrdersLoading(true);
    try {
      const url = new URL(`${API_ORIGIN}/api/getallorders`);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      if (search) url.searchParams.append('search', search);

      const response = await fetch(url.toString());
      console.log(response);
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();

      console.log('Orders API Response:', data);

      // Handle different response formats
      let ordersData = [];
      let paginationData = {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      };

      if (data.status === true) {
        // Custom wrapped response format
        ordersData = data.data || [];
        paginationData = data.pagination || paginationData;
      } else if (data.current_page !== undefined && Array.isArray(data.data)) {
        // Direct Laravel pagination format
        ordersData = data.data || [];
        paginationData = {
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 20,
          total: data.total || 0
        };
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response format');
      }

      setOrders(ordersData);
      setOrdersPagination(paginationData);

    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders([]);
      setOrdersPagination({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      });
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load orders only when orders tab is accessed
  useEffect(() => {
    if (currentRoute === 'orders') {
      fetchOrders(1, '', 20);
    }
  }, [currentRoute, fetchOrders]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts(1, '', 10);
  }, [fetchProducts]);

  // Search filter helper for other data
  const filteredData = useCallback((data) => {
    const q = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(q)
      )
    );
  }, [searchTerm]);

  const filteredUsers = useMemo(() => filteredData(users), [users, filteredData]);
  const filteredCategories = useMemo(() => filteredData(categories), [categories, filteredData]);

  // Modal controls
  const openModal = useCallback((type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  }, []);

  // ✅ COMPLETELY FIXED Category API functions with comprehensive error handling
  const createCategoryApi = async (payload) => {
    console.log('CREATE CATEGORY - Starting with payload:', payload);
    
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Category name is required');
    }
    
    const form = new FormData();
    form.append('name', payload.name.trim());
    
    // Handle image properly
    if (payload.image) {
      if (payload.image instanceof File) {
        console.log('Appending File object:', payload.image.name, payload.image.size, 'bytes');
        form.append('image', payload.image);
      } else if (typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
        console.log('Converting data URL to blob');
        try {
          const res = await fetch(payload.image);
          const blob = await res.blob();
          form.append('image', blob, `category_${Date.now()}.jpg`);
        } catch (err) {
          console.error('Error processing data URL:', err);
          throw new Error('Failed to process image data');
        }
      } else if (typeof payload.image === 'string' && payload.image.startsWith('http')) {
        console.log('Using image URL:', payload.image);
        form.append('image', payload.image);
      } else {
        console.error('Invalid image format:', typeof payload.image);
        throw new Error('Invalid image format');
      }
    } else {
      throw new Error('Image is required');
    }

    // Debug FormData
    console.log('FormData contents:');
    for (let [key, value] of form.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    try {
      const response = await fetch(`${API_ORIGIN}/api/admin/add-category`, {
        method: 'POST',
        body: form,
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
      
      return data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  };

  const editCategoryApi = async (id, payload) => {
    console.log('EDIT CATEGORY - Starting with ID:', id, 'payload:', payload);

    const form = new FormData();
    form.append('id', String(id));
    
    if (payload.name !== undefined) {
      form.append('name', payload.name.trim());
    }

    // Handle image properly for edit
    if (payload.image !== undefined) {
      if (payload.image instanceof File) {
        console.log('Appending new File object');
        form.append('image', payload.image);
      } else if (typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
        console.log('Converting data URL to blob for edit');
        try {
          const res = await fetch(payload.image);
          const blob = await res.blob();
          form.append('image', blob, `category_${Date.now()}.jpg`);
        } catch (err) {
          console.error('Error processing data URL:', err);
          throw new Error('Failed to process image data');
        }
      } else if (typeof payload.image === 'string' && payload.image.startsWith('http')) {
        console.log('Using image URL for edit:', payload.image);
        form.append('image', payload.image);
      }
    }

    try {
      const response = await fetch(`${API_ORIGIN}/api/admin/edit-category`, {
        method: 'POST',
        body: form,
      });

      const responseText = await response.text();
      console.log('Edit response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Edit category error:', error);
      throw error;
    }
  };

  const deleteCategoryApi = async (id) => {
    console.log('Calling deleteCategoryApi with ID:', id);
    const res = await fetch(`${API_ORIGIN}/api/delete-category/${id}`, {
      method: 'DELETE',
    });
    console.log('Delete category response status:', res.status);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('Delete category error response:', text);
      throw new Error(text || 'Failed to delete category');
    }
    return true;
  };

  // Refresh categories after create/update
  const refreshCategories = async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/home-filters`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    } catch (err) {
      console.error('Failed to refresh categories:', err);
    }
  };

  // ✅ COMPLETELY FIXED Product and Category handlers
  const handleModalSubmit = useCallback(async (payload) => {
    console.log('🚀 handleModalSubmit called with:', { modalType, payload });
    
    setSubmitting(true);
    try {
      if (modalType === 'category') {
        if (editingItem) {
          // Edit category
          const updated = await editCategoryApi(editingItem.id, payload);
          if (updated.status) {
            await refreshCategories();
            closeModal();
            alert('Category updated successfully!');
          } else {
            throw new Error(updated.message || 'Failed to update category');
          }
        } else {
          // Create category
          const created = await createCategoryApi(payload);
          if (created.status) {
            await refreshCategories();
            closeModal();
            alert('Category created successfully!');
          } else {
            throw new Error(created.message || 'Failed to create category');
          }
        }
      } else if (modalType === 'product') {
        // Product handling remains the same
        const form = new FormData();
        
        if (editingItem) {
          form.append('id', String(editingItem.id));
        }

        // Clean and validate data before sending
        const cleanText = (text) => {
          if (!text) return '';
          return String(text).replace(/[^\u0000-\u007F]/g, '').trim();
        };

        form.append('category_id', String(payload.category_id || ''));
        form.append('type', payload.type || 'recommendedForYouSection');
        form.append('name', cleanText(payload.name) || '');
        form.append('slug', cleanText(payload.slug || payload.name?.toLowerCase().replace(/\s+/g, '-')) || '');
        form.append('description', cleanText(payload.description) || '');
        
        // Ensure numeric values are valid
        const price = parseFloat(payload.price) || 0;
        form.append('price', price.toFixed(2));
        
        if (payload.sale_price && !isNaN(parseFloat(payload.sale_price))) {
          form.append('sale_price', parseFloat(payload.sale_price).toFixed(2));
        }
        
        // Handle ingredients as JSON string
        if (payload.ingredients && Array.isArray(payload.ingredients)) {
          const validIngredients = payload.ingredients
            .filter(ing => ing && ing.trim())
            .map(ing => cleanText(ing));
          
          if (validIngredients.length > 0) {
            form.append('ingredients', JSON.stringify(validIngredients));
          }
        }
        
        form.append('spice_level', payload.spice_level || 'None');
        form.append('preparation_time', String(parseInt(payload.preparation_time) || 15));
        form.append('is_featured', payload.is_featured ? '1' : '0');
        form.append('is_available', payload.is_available !== false ? '1' : '0');
        form.append('status', payload.status || 'active');
        form.append('average_rating', String(payload.average_rating || 0));
        
        // Enhanced featured image handling
        if (payload.featured_image) {
          if (payload.featured_image instanceof File) {
            form.append('featured_image', payload.featured_image);
          } else if (typeof payload.featured_image === 'string' && payload.featured_image.startsWith('data:image/')) {
            try {
              const res = await fetch(payload.featured_image);
              const blob = await res.blob();
              form.append('featured_image', blob, 'featured_image.jpg');
            } catch (err) {
              console.error('Featured image processing error:', err);
            }
          } else if (typeof payload.featured_image === 'string' && payload.featured_image.startsWith('http')) {
            form.append('featured_image', payload.featured_image);
          }
        }
        
        // Enhanced gallery images handling
        if (payload.gallery_images && Array.isArray(payload.gallery_images)) {
          const galleryPromises = payload.gallery_images.map(async (image, index) => {
            if (image instanceof File) {
              form.append('gallery_images[]', image);
            } else if (typeof image === 'string' && image.startsWith('data:image/')) {
              try {
                const res = await fetch(image);
                const blob = await res.blob();
                form.append('gallery_images[]', blob, `gallery_${index}.jpg`);
              } catch (err) {
                console.error(`Gallery image ${index} processing error:`, err);
              }
            } else if (typeof image === 'string' && image.startsWith('http')) {
              form.append('gallery_images[]', image);
            }
          });
          
          await Promise.all(galleryPromises);
        }
        
        const endpoint = editingItem ? 'edit-product' : 'add-product';
        
        const response = await fetch(`${API_ORIGIN}/api/admin/${endpoint}`, {
          method: 'POST',
          body: form,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        const responseText = await response.text();
        
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
            if (errorData.errors) {
              const validationErrors = Object.values(errorData.errors).flat().join(', ');
              errorMessage += `: ${validationErrors}`;
            }
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const data = JSON.parse(responseText);
        if (data.status) {
          await fetchProducts(pagination.current_page || 1, searchTerm, pagination.per_page || 10);
          closeModal();
        } else {
          throw new Error(data.message || 'Operation failed');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(`Failed to save changes: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [editingItem, modalType, closeModal, fetchProducts, pagination, searchTerm]);

  const handleCreateCategory = useCallback(async (payload) => {
    return handleModalSubmit(payload);
  }, [handleModalSubmit]);

  const handleEditCategory = useCallback(async (payload) => {
    return handleModalSubmit(payload);
  }, [handleModalSubmit]);

  // ENHANCED DELETE HANDLER WITH BETTER ERROR HANDLING AND DEBUGGING
  const handleDelete = useCallback(async (type, id) => {
    console.log('🗑️ DELETE BUTTON CLICKED:', { type, id });
    
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      console.log('❌ Delete cancelled by user');
      return;
    }
    
    try {
      console.log(`🔄 Starting delete process for ${type} with ID: ${id}`);
      
      if (type === 'category') {
        console.log('📂 Deleting category...');
        await deleteCategoryApi(id);
        await refreshCategories();
        console.log('✅ Category deleted successfully');
        
      } else if (type === 'product') {
        console.log('📦 Deleting product...');
        const response = await fetch(`${API_ORIGIN}/api/admin/delete-product`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id: String(id) }),
        });
        
        console.log('📦 Delete product response status:', response.status);
        
        const responseText = await response.text();
        console.log('📦 Delete product response:', responseText);
        
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const data = JSON.parse(responseText);
        if (data.status) {
          console.log('✅ Product deleted, refreshing products list');
          await fetchProducts(pagination.current_page || 1, searchTerm, pagination.per_page || 10);
          console.log('✅ Product deleted successfully');
        } else {
          throw new Error(data.message || 'Delete failed');
        }
        
      } else if (type === 'user') {
        console.log('👤 Deleting user...');
        setUsers((us) => {
          console.log('✅ User deleted, updating state');
          return us.filter((u) => u.id !== id);
        });
        console.log('✅ User deleted successfully');
      }
      
      // Success notification
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert(`Failed to delete ${type}: ${err.message}`);
    }
  }, [fetchProducts, pagination, searchTerm]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    console.log('📝 Updating order status:', { orderId, newStatus });
    try {
      const response = await fetch(`${API_ORIGIN}/api/orders/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus
        }),
      });

      const data = await response.json();
      console.log('📝 Update status response:', data);
      
      if (data.status) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        console.log('✅ Order status updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Update status error:', error);
      alert(`Failed to update order status: ${error.message}`);
    }
  }, []);

  // ENHANCED DELETE ORDER WITH BETTER ERROR HANDLING
  const deleteOrder = useCallback(async (orderId) => {
    console.log('🗑️ DELETE ORDER BUTTON CLICKED:', orderId);
    
    if (!window.confirm('Are you sure you want to delete this order?')) {
      console.log('❌ Order delete cancelled by user');
      return;
    }
    
    try {
      console.log(`🔄 Starting delete process for order ID: ${orderId}`);
      
      const response = await fetch(`${API_ORIGIN}/api/orders/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: orderId }),
      });

      console.log('🗑️ Delete order response status:', response.status);
      
      const data = await response.json();
      console.log('🗑️ Delete order response:', data);
      
      if (data.status) {
        console.log('✅ Order deleted, refreshing orders list');
        await fetchOrders(ordersPagination.current_page || 1, ordersSearchTerm, ordersPagination.per_page || 20);
        console.log('✅ Order deleted successfully');
        alert('Order deleted successfully!');
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('❌ Delete order error:', error);
      alert(`Failed to delete order: ${error.message}`);
    }
  }, [fetchOrders, ordersPagination, ordersSearchTerm]);

  // Format currency - ✅ UPDATED to use INR (Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(parseFloat(amount) || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'out_for_delivery': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Render modal content based on type
  const renderModal = () => {
    if (!showModal) return null;

    if (modalType === 'orderDetails') {
      return <OrderDetailsModal order={editingItem} onClose={closeModal} />;
    }

    return (
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        editingItem={editingItem}
        onSubmit={handleModalSubmit}
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        submitting={submitting}
        categories={categories}
      />
    );
  };

  const renderContent = useMemo(() => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value="₹12,450"
                icon={DollarSign}
                color="from-green-500 to-emerald-600"
                change="12.5"
                trend="up"
              />
              <StatCard
                title="Total Orders"
                value={ordersPagination.total || 0}
                icon={ShoppingCart}
                color="from-blue-500 to-cyan-600"
                change="8.2"
                trend="up"
              />
              <StatCard
                title="Total Products"
                value={pagination.total || products.length}
                icon={Package}
                color="from-purple-500 to-pink-600"
                change="3.1"
                trend="up"
              />
              <StatCard
                title="Total Users"
                value={users.length}
                icon={UsersIcon}
                color="from-orange-500 to-red-600"
                change="5.7"
                trend="down"
              />
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              </div>
              <div className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="mx-auto h-8 w-8 mb-2" />
                    <p>No recent orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{order.user?.name || 'Unknown Customer'}</div>
                          
                          {/* ✅ ENHANCED Dashboard Address Display */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-start text-xs text-gray-500">
                              <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="line-clamp-2">{order.address?.full_address || 'Address not available'}</p>
                                <p className="text-gray-400 mt-1">
                                  {order.address?.area && order.address?.city ? 
                                    `📍 ${order.address.area}, ${order.address.city}` : 
                                    '📍 Location not specified'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">{order.products?.length || 0} items</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                <p className="text-gray-500">Manage your food categories</p>
              </div>
              <button
                onClick={() => openModal('category')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={category.image || '/api/placeholder/300/200'}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status || 'Active'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal('category', category)}
                        className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔴 Category delete button clicked for ID:', category.id);
                          handleDelete('category', category.id);
                        }}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors relative z-10"
                        style={{ pointerEvents: 'auto' }}
                        title={`Delete category: ${category.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <p className="text-gray-500">Manage your menu items</p>
              </div>
              <button
                onClick={() => openModal('product')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Search input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  clearTimeout(window.searchTimeout);
                  window.searchTimeout = setTimeout(() => {
                    fetchProducts(1, e.target.value, pagination.per_page || 10);
                  }, 500);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={product.featured_image || '/api/placeholder/300/200'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                      {product.is_featured && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-gray-500 text-sm capitalize">{product.type?.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-gray-400 text-sm">Category: {product.category?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">₹{product.price}</p>
                        {product.sale_price && (
                          <p className="text-sm text-red-500 line-through">₹{product.sale_price}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{product.average_rating || 0}</span>
                        <span>({product.rating_count || 0})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{product.preparation_time || 0}min</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.spice_level === 'Hot' ? 'bg-red-100 text-red-800' :
                        product.spice_level === 'Medium' ? 'bg-orange-100 text-orange-800' :
                        product.spice_level === 'Mild' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {product.spice_level || 'None'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal('product', product)}
                        className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔴 Product delete button clicked for ID:', product.id);
                          handleDelete('product', product.id);
                        }}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors relative z-10"
                        style={{ pointerEvents: 'auto' }}
                        title={`Delete product: ${product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new product.'}
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={!pagination.current_page || pagination.current_page <= 1}
                onClick={() => fetchProducts(pagination.current_page - 1, searchTerm, pagination.per_page || 10)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Page {pagination.current_page || 1} of {pagination.last_page || 1}
                </span>
                <span className="text-xs text-gray-500">
                  ({pagination.total || 0} total products)
                </span>
              </div>

              <button
                disabled={!pagination.current_page || pagination.current_page >= pagination.last_page}
                onClick={() => fetchProducts(pagination.current_page + 1, searchTerm, pagination.per_page || 10)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Orders</h2>
                <p className="text-gray-500">Manage customer orders</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Today</span>
                </button>
              </div>
            </div>

            {/* Search input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or status..."
                value={ordersSearchTerm}
                onChange={(e) => {
                  setOrdersSearchTerm(e.target.value);
                  clearTimeout(window.ordersSearchTimeout);
                  window.ordersSearchTimeout = setTimeout(() => {
                    fetchOrders(1, e.target.value, ordersPagination.per_page || 20);
                  }, 500);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                                <div className="text-xs text-gray-500">{order.order_number}</div>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDate(order.created_at)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.user?.name || 'Unknown Customer'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.user?.email || 'N/A'}
                                </div>
                                
                                {/* ✅ ENHANCED Orders Table Address Display */}
                                <div className="mt-2 max-w-xs">
                                  <div className="flex items-start text-xs text-gray-500">
                                    <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p 
                                        className="line-clamp-1 font-medium cursor-help"
                                        title={order.address?.full_address || 'Address not available'}
                                      >
                                        {order.address?.full_address?.substring(0, 40) || 'Address not available'}
                                        {order.address?.full_address?.length > 40 ? '...' : ''}
                                      </p>
                                      <p className="text-gray-400">
                                        {order.address?.area && order.address?.city ? 
                                          `📍 ${order.address.area}, ${order.address.city}` : 
                                          '📍 Location not specified'
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.products?.length || 0} items
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.products?.slice(0, 2).map(p => p.name).join(', ')}
                                {order.products?.length > 2 && '...'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(order.total_amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Subtotal: {formatCurrency(order.subtotal)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {order.payment_method || 'COD'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(order.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => openModal('orderDetails', order)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🔴 Order delete button clicked for ID:', order.id);
                                    deleteOrder(order.id);
                                  }}
                                  className="text-red-600 hover:text-red-900 transition-colors relative z-10"
                                  style={{ pointerEvents: 'auto' }}
                                  title={`Delete order #${order.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Empty state */}
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {ordersSearchTerm ? 'Try adjusting your search terms.' : 'Orders will appear here when customers place them.'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    disabled={!ordersPagination.current_page || ordersPagination.current_page <= 1}
                    onClick={() => fetchOrders(ordersPagination.current_page - 1, ordersSearchTerm, ordersPagination.per_page || 20)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Page {ordersPagination.current_page || 1} of {ordersPagination.last_page || 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({ordersPagination.total || 0} total orders)
                    </span>
                  </div>

                  <button
                    disabled={!ordersPagination.current_page || ordersPagination.current_page >= ordersPagination.last_page}
                    onClick={() => fetchOrders(ordersPagination.current_page + 1, ordersSearchTerm, ordersPagination.per_page || 20)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Users</h2>
                <p className="text-gray-500">Manage your customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Orders</p>
                      <p className="text-lg font-bold text-gray-900">{user.orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Spent</p>
                      <p className="text-lg font-bold text-green-600">₹{user.totalSpent}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Joined: {user.joined}</p>
                    <p>Last Order: {user.lastOrder}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔴 User delete button clicked for ID:', user.id);
                        handleDelete('user', user.id);
                      }}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors relative z-10"
                      style={{ pointerEvents: 'auto' }}
                      title={`Delete user: ${user.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-500">Configure your application settings</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    defaultValue="FoodAdmin Restaurant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    defaultValue="admin@foodadmin.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Page not found</p>
          </div>
        );
    }
  }, [currentRoute, orders, products, users, filteredUsers, filteredCategories, updateOrderStatus, deleteOrder, openModal, ordersPagination, ordersSearchTerm, fetchOrders, ordersLoading, pagination, searchTerm, fetchProducts, handleDelete]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header
          setSidebarOpen={setSidebarOpen}
          currentRoute={currentRoute}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent}
          </div>
        </main>
      </div>

      {/* Render modal based on type */}
      {renderModal()}
    </div>
  );
};

export default AdminPanel;