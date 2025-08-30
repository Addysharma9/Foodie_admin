import React, { useCallback, useEffect, useState } from 'react';
import { X, Package, Eye, Plus, Minus } from 'lucide-react';

const Modal = React.memo(function Modal({
  showModal,
  closeModal,
  modalType,        // 'category' | 'product'
  editingItem,      // object or null
  onSubmit,         // function(payload)
  onCreateCategory, // function(payload)
  onEditCategory,   // function(payload)
  categories = [],  // for category select
  submitting = false
}) {
  const [localData, setLocalData] = useState(editingItem || {});
  const [imagePreview, setImagePreview] = useState('');
  const [imageType, setImageType] = useState('string');
  const [ingredients, setIngredients] = useState(['']);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (editingItem && modalType === 'product') {
      setLocalData({
        ...editingItem,
        // fallback to 0 if undefined or not a number
        average_rating: typeof editingItem.average_rating === 'number'
          ? editingItem.average_rating
          : Number(editingItem.average_rating) || 0
      });
      setImagePreview(editingItem?.featured_image || '');
      // Parse ingredients
      if (editingItem?.ingredients) {
        try {
          const parsedIngredients =
            typeof editingItem.ingredients === 'string'
              ? JSON.parse(editingItem.ingredients)
              : editingItem.ingredients;
          setIngredients(Array.isArray(parsedIngredients) ? parsedIngredients : ['']);
        } catch {
          setIngredients(['']);
        }
      } else {
        setIngredients(['']);
      }
      // Parse gallery
      if (editingItem?.gallery_images) {
        try {
          const parsedGallery =
            typeof editingItem.gallery_images === 'string'
              ? JSON.parse(editingItem.gallery_images)
              : editingItem.gallery_images;
          setGalleryPreviews(Array.isArray(parsedGallery) ? parsedGallery : []);
        } catch {
          setGalleryPreviews([]);
        }
      } else {
        setGalleryPreviews([]);
      }
      // Set discount
      if (editingItem?.price && editingItem?.sale_price) {
        const calculatedDiscount = Math.round(
          ((editingItem.price - editingItem.sale_price) / editingItem.price) * 100
        );
        setDiscount(calculatedDiscount > 0 ? calculatedDiscount : 0);
      } else {
        setDiscount(0);
      }
    } else {
      setLocalData(editingItem || {});
      setImagePreview('');
      setIngredients(['']);
      setGalleryPreviews([]);
      setDiscount(0);
    }
    setImageType('string');
  }, [editingItem, showModal, modalType]);

  const handleChange = useCallback(
    (field, value) => {
      setLocalData((prev) => ({ ...prev, [field]: value }));
      if (field === 'name' && modalType === 'product') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        setLocalData((prev) => ({ ...prev, slug }));
      }
    },
    [modalType]
  );

  // Auto-calculate sale price based on discount
  const calculateSalePrice = useCallback((price, discountPercent) => {
    if (!price || !discountPercent || discountPercent <= 0) return null;
    const numPrice = parseFloat(price);
    const numDiscount = parseFloat(discountPercent);
    const discountAmount = (numPrice * numDiscount) / 100;
    return Math.round((numPrice - discountAmount) * 100) / 100;
  }, []);

  const handleImageUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64String = ev.target?.result || '';
        setImagePreview(String(base64String));
        setLocalData((prev) => ({
          ...prev,
          [modalType === 'product' ? 'featured_image' : 'image']: base64String
        }));
      };
      reader.readAsDataURL(file);
    },
    [modalType]
  );

  const handleGalleryUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = [];
    const newGalleryImages = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64String = ev.target?.result || '';
        newPreviews.push(base64String);
        newGalleryImages.push(base64String);
        if (newPreviews.length === files.length) {
          setGalleryPreviews((prev) => [...prev, ...newPreviews]);
          setLocalData((prev) => ({
            ...prev,
            gallery_images: [...(prev.gallery_images || []), ...newGalleryImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeGalleryImage = useCallback((index) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setLocalData((prev) => ({
      ...prev,
      gallery_images: (prev.gallery_images || []).filter((_, i) => i !== index)
    }));
  }, []);

  const handleCameraCapture = handleImageUpload;

  const handleImageUrlChange = useCallback(
    (e) => {
      const url = e.target.value;
      setImagePreview(url);
      setLocalData((prev) => ({
        ...prev,
        [modalType === 'product' ? 'featured_image' : 'image']: url
      }));
    },
    [modalType]
  );

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, '']);
  }, []);

  const removeIngredient = useCallback((index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateIngredient = useCallback((index, value) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? value : ing)));
  }, []);

  const submit = useCallback(
  (e) => {
    e.preventDefault();
    
    // Prepare final payload
    const payload = { ...localData };
    
    if (modalType === 'product') {
      // Add ingredients array (filter out empty ones)
      payload.ingredients = ingredients.filter((ing) => ing.trim() !== '');
      
      // Ensure required fields have defaults and are properly typed
      payload.category_id = payload.category_id || '';
      payload.type = payload.type || 'recommendedForYouSection';
      payload.spice_level = payload.spice_level || 'None';
      payload.preparation_time = parseInt(payload.preparation_time) || 15;
      payload.status = payload.status || 'active';
      payload.is_featured = Boolean(payload.is_featured);
      payload.is_available = payload.is_available !== false;
      
      // Ensure pricing fields are properly formatted numbers
      payload.price = parseFloat(payload.price) || 0;
      if (payload.sale_price && !isNaN(parseFloat(payload.sale_price))) {
        payload.sale_price = parseFloat(payload.sale_price);
      } else {
        payload.sale_price = null;
      }
      
      // FIXED: Ensure average_rating is always included as a number
      payload.average_rating = parseFloat(payload.average_rating) || 0;
      // Clamp between 0 and 5
      payload.average_rating = Math.max(0, Math.min(5, payload.average_rating));
      
      // Debug log to check if average_rating is in payload
      console.log('Payload being sent:', payload);
      console.log('FORMDATA average_rating', payload.average_rating);

      console.log('Average rating value:', payload.average_rating);
    }

    if (modalType === 'category') {
      if (editingItem) {
        onEditCategory?.(payload);
      } else {
        onCreateCategory?.(payload);
      }
    } else if (modalType === 'product') {
      onSubmit?.(payload);
    }
  },
  [modalType, editingItem, localData, ingredients, onEditCategory, onCreateCategory, onSubmit]
);


  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingItem ? 'Edit' : 'Add'} {modalType === 'category' ? 'Category' : 'Product'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={localData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter name..."
                required
              />
            </div>
            {modalType === 'product' && (
              <>
                {/* Slug Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={localData.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder="Auto-generated from name"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={localData.category_id || ''}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section Type *</label>
                  <select
                    value={localData.type || 'recommendedForYouSection'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="recommendedForYouSection">Recommended For You Section</option>
                    <option value="topSection">Top Section</option>
                    <option value="fullCardSection">Full Card Section</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={localData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter product description..."
                  />
                </div>
                {/* Pricing with Auto-discount */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localData.price || ''}
                      onChange={(e) => {
                        const price = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                        handleChange('price', price);
                        if (discount > 0 && price) {
                          const salePrice = calculateSalePrice(price, discount);
                          handleChange('sale_price', salePrice);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={discount || ''}
                      onChange={(e) => {
                        const discountValue = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        setDiscount(discountValue);
                        if (localData.price && discountValue > 0) {
                          const salePrice = calculateSalePrice(localData.price, discountValue);
                          handleChange('sale_price', salePrice);
                        } else if (discountValue === 0) {
                          handleChange('sale_price', null);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localData.sale_price || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseFloat(e.target.value) || null;
                        handleChange('sale_price', value);
                        if (value && localData.price && value < localData.price) {
                          const calculatedDiscount = Math.round(
                            ((localData.price - value) / localData.price) * 100
                          );
                          setDiscount(calculatedDiscount);
                        } else if (!value) {
                          setDiscount(0);
                        }
                      }}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        discount > 0 ? 'bg-gray-50' : ''
                      }`}
                      placeholder="Auto-calculated"
                      readOnly={discount > 0}
                    />
                    {discount > 0 && (
                      <p className="text-xs text-green-600 mt-1">{discount}% discount applied</p>
                    )}
                  </div>
                </div>
                {/* Spice Level & Prep Time & Average Rating */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Spice Level</label>
                    <select
                      value={localData.spice_level || 'None'}
                      onChange={(e) => handleChange('spice_level', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="None">None</option>
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Hot">Hot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      value={localData.preparation_time || 15}
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? 15 : parseInt(e.target.value) || 15;
                        handleChange('preparation_time', value);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="15"
                    />
                  </div>
                  {/* Average Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Average Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={localData.average_rating ?? 0}
                      onChange={(e) => {
                        // Always keep numeric and within 0~5, update localData accordingly
                        const inputVal = e.target.value;
                        let value = (inputVal === '' || isNaN(inputVal)) ? 0 : parseFloat(inputVal);
                        if (value < 0) value = 0;
                        if (value > 5) value = 5;
                        handleChange('average_rating', value);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rating out of 5.0</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients</label>
                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={`Ingredient ${index + 1}`}
                        />
                        {ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="px-3 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Ingredient
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={localData.status || 'active'}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!localData.is_featured}
                        onChange={(e) => handleChange('is_featured', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localData.is_available !== false}
                        onChange={(e) => handleChange('is_available', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
              </>
            )}
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {modalType === 'product' ? 'Featured Image' : 'Image'}
              </label>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setImageType('string')}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    imageType === 'string'
                      ? 'bg-blue-100 text-blue-600 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  URL/String
                </button>
                <button
                  type="button"
                  onClick={() => setImageType('upload')}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    imageType === 'upload'
                      ? 'bg-blue-100 text-blue-600 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  Upload/Camera
                </button>
              </div>
              {imageType === 'string' && (
                <input
                  type="text"
                  value={localData[modalType === 'product' ? 'featured_image' : 'image'] || ''}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter image URL..."
                />
              )}
              {imageType === 'upload' && (
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="text-center">
                        <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Choose file from device</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Take photo with camera</span>
                      </div>
                      <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/150/150';
                    }}
                  />
                </div>
              )}
            </div>
            {modalType === 'product' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images</label>
                <div>
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">Choose multiple images</span>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                  </label>
                </div>
                {galleryPreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Gallery Preview:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 ${
                  submitting ? 'opacity-60 cursor-not-allowed' : ''
                } bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg`}
              >
                {submitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className={`flex-1 ${
                  submitting ? 'opacity-60 cursor-not-allowed' : ''
                } bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default Modal;
