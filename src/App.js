import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Edit, Trash2, Package, ShoppingCart, DollarSign,
  Calendar, Filter, Star, Clock, MapPin, Users as UsersIcon
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';
import StatCard from './components/StatCard';

const API_ORIGIN = 'http://212.38.94.189:8000';

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
  const [orders, setOrders] = useState([
    { id: 1001, customer: 'John Doe', items: 3, total: 45.97, status: 'Delivered', date: '2024-08-16', time: '14:30', address: '123 Main St', phone: '+1234567890' },
    { id: 1002, customer: 'Jane Smith', items: 2, total: 28.98, status: 'Preparing', date: '2024-08-16', time: '13:15', address: '456 Oak Ave', phone: '+1234567891' },
  ]);
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

  const filteredOrders = useMemo(() => filteredData(orders), [orders, filteredData]);
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

  // Category API functions (existing)
  const createCategoryApi = async (payload) => {
    const form = new FormData();
    form.append('name', payload.name || '');
    
    async function toBlobFromAny(imageValue) {
      if (!imageValue) return null;
      const isDataUrl = typeof imageValue === 'string' && imageValue.startsWith('data:');
      if (isDataUrl) {
        const res = await fetch(imageValue);
        return await res.blob();
      }
      return null;
    }
    
    const blob = await toBlobFromAny(payload.image);
    if (blob) {
      const filename = `image_${Date.now()}.jpg`;
      form.append('image', blob, filename);
    } else if (typeof payload.image === 'string' && /^https?:\/\//i.test(payload.image)) {
      form.append('image', payload.image);
    }
    
    const response = await fetch(`${API_ORIGIN}/api/admin/add-category`, {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || 'Failed to add category');
    }
    return await response.json();
  };

  const editCategoryApi = async (id, payload) => {
    const form = new FormData();
    form.append('id', String(id));
    
    if (payload.name !== undefined) {
      form.append('name', payload.name);
    }
    
    async function toBlobFromAny(imageValue) {
      if (!imageValue) return null;
      const isDataUrl = typeof imageValue === 'string' && imageValue.startsWith('data:');
      if (isDataUrl) {
        const res = await fetch(imageValue);
        return await res.blob();
      }
      return null;
    }
    
    const blob = await toBlobFromAny(payload.image);
    if (blob) {
      const filename = `image_${Date.now()}.jpg`;
      form.append('image', blob, filename);
    } else if (typeof payload.image === 'string' && /^https?:\/\//i.test(payload.image)) {
      form.append('image', payload.image);
    }
    
    const res = await fetch(`${API_ORIGIN}/api/admin/edit-category`, {
      method: 'POST',
      body: form,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Failed to edit category');
    }
    return await res.json();
  };

  const deleteCategoryApi = async (id) => {
    const res = await fetch(`${API_ORIGIN}/api/delete-category/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Failed to delete category');
    }
    return true;
  };

  // Product and Category handlers
 // Product and Category handlers
const handleModalSubmit = useCallback(async (payload) => {
  setSubmitting(true);
  try {
    if (modalType === 'product') {
      const form = new FormData();
      
      if (editingItem) {
        form.append('id', String(editingItem.id));
      }

      // Clean and validate data before sending
      const cleanText = (text) => {
        if (!text) return '';
        return String(text).replace(/[^\u0000-\u007F]/g, '').trim();
      };

      // Add all product fields with proper validation
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
      
      // Handle ingredients as JSON string (not array of form fields)
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
      
      // ADD THIS LINE: Handle average_rating field
      form.append('average_rating', String(payload.average_rating || 0));
      
      // Handle featured image with proper error handling
      if (payload.featured_image) {
        if (payload.featured_image.startsWith('data:image/')) {
          try {
            const res = await fetch(payload.featured_image);
            const blob = await res.blob();
            form.append('featured_image', blob, 'featured_image.jpg');
          } catch (err) {
            console.error('Featured image processing error:', err);
          }
        } else if (payload.featured_image.startsWith('http')) {
          form.append('featured_image', payload.featured_image);
        }
      }
      
      // Handle gallery images properly (wait for all to process)
      if (payload.gallery_images && Array.isArray(payload.gallery_images)) {
        const galleryPromises = payload.gallery_images.map(async (image, index) => {
          if (image.startsWith('data:image/')) {
            try {
              const res = await fetch(image);
              const blob = await res.blob();
              form.append('gallery_images[]', blob, `gallery_${index}.jpg`);
            } catch (err) {
              console.error(`Gallery image ${index} processing error:`, err);
            }
          }
        });
        
        // Wait for all gallery images to be processed
        await Promise.all(galleryPromises);
      }
      
      const endpoint = editingItem ? 'edit-product' : 'add-product';
      
      console.log('Sending request to:', `${API_ORIGIN}/api/admin/${endpoint}`);
      
      const response = await fetch(`${API_ORIGIN}/api/admin/${endpoint}`, {
        method: 'POST',
        body: form,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData - let browser set it
        }
      });
      
      // Get response text first to handle both success and error cases
      const responseText = await response.text();
      console.log('Server response:', responseText);
      
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
        // Refresh products list
        await fetchProducts(pagination.current_page || 1, searchTerm, pagination.per_page || 10);
        closeModal();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
      
    } else if (modalType === 'category') {
      if (editingItem) {
        const updated = await editCategoryApi(editingItem.id, payload);
        if (updated.status) {
          setCategories((cats) => cats.map((cat) => (cat.id === editingItem.id ? { ...cat, ...updated.data } : cat)));
          closeModal();
        }
      } else {
        const created = await createCategoryApi(payload);
        if (created.status) {
          const newCat = {
            id: created.data?.id ?? Date.now(),
            name: created.data?.name ?? payload.name ?? 'Untitled',
            image: created.data?.image ?? payload.image ?? '',
            status: created.data?.status ?? 'Active',
          };
          setCategories((cats) => [newCat, ...cats]);
          closeModal();
        }
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

const handleDelete = useCallback(async (type, id) => {
  if (!window.confirm('Are you sure you want to delete this item?')) return;
  
  try {
    if (type === 'category') {
      await deleteCategoryApi(id);
      setCategories((cats) => cats.filter((c) => c.id !== id));
    } else if (type === 'product') {
      const response = await fetch(`${API_ORIGIN}/api/admin/delete-product`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: String(id) }),
      });
      
      const responseText = await response.text();
      
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
        // Refresh products list
        await fetchProducts(pagination.current_page || 1, searchTerm, pagination.per_page || 10);
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } else if (type === 'user') {
      setUsers((us) => us.filter((u) => u.id !== id));
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert(`Failed to delete item: ${err.message}`);
  }
}, [fetchProducts, pagination, searchTerm]);

const updateOrderStatus = useCallback((orderId, newStatus) => {
  setOrders((ords) => ords.map((order) =>
    order.id === orderId ? { ...order, status: newStatus } : order
  ));
}, []);


  const renderContent = useMemo(() => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value="$12,450"
                icon={DollarSign}
                color="from-green-500 to-emerald-600"
                change="12.5"
                trend="up"
              />
              <StatCard
                title="Total Orders"
                value={orders.length}
                icon={ShoppingCart}
                color="from-blue-500 to-cyan-600"
                change="8.2"
                trend="up"
              />
              <StatCard
                title="Total Products"
                value={products.length}
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
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.time}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {order.address.substring(0, 20)}...
                        </div>
                        <span className="text-sm font-medium text-gray-900">{order.items} items</span>{' '}
                        <span className="text-sm font-bold text-gray-900">${order.total}</span>{' '}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Pending' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                        onClick={() => handleDelete('category', category.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
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
                  // Debounce search to avoid too many API calls
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
                        <p className="text-xl font-bold text-blue-600">${product.price}</p>
                        {product.sale_price && (
                          <p className="text-sm text-red-500 line-through">${product.sale_price}</p>
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
                        onClick={() => handleDelete('product', product.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {order.time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {order.address.substring(0, 20)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{order.items} items</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">${order.total}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'Pending' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                      <p className="text-lg font-bold text-green-600">${user.totalSpent}</p>
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
                      onClick={() => handleDelete('user', user.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
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
  }, [currentRoute, orders, products, users, filteredOrders, filteredUsers, filteredCategories, updateOrderStatus, handleDelete, openModal, pagination, searchTerm, fetchProducts]);

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
    </div>
  );
};

export default AdminPanel;
