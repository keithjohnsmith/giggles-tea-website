import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function ProductForm({
  product,
  onSave,
  onCancel,
  isLoading = false,
  error = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    german_name: '',
    price: 0,
    description: '',
    categories: [],
    is_active: true,
    images: []
  });
  const [availableCategories, setAvailableCategories] = useState([
    { id: '1', name_en: 'Black Tea' },
    { id: '2', name_en: 'Green Tea' },
    { id: '3', name_en: 'Herbal Tea' },
    { id: '4', name_en: 'Oolong Tea' },
    { id: '5', name_en: 'White Tea' },
  ]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Initialize form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        german_name: product.german_name || '',
        price: product.price || 0,
        description: product.description || '',
        categories: product.categories || [],
        is_active: product.is_active !== undefined ? product.is_active : true,
        images: product.images || []
      });
      
      // Set up image previews
      if (product.images && product.images.length > 0) {
        // Use the correct base URL for images
        const baseUrl = 'http://localhost:8000/server/Tea%20Catalogue';
        console.log('Image base URL:', baseUrl); // Debug log
        
        const previews = product.images.map(img => {
          try {
            // If image is already a fully qualified URL, use it as is
            if (typeof img === 'object' && img.url) {
              // If URL is already absolute, use it directly
              if (img.url.startsWith('http') || img.url.startsWith('blob:')) {
                return {
                  id: img.id || img.url,
                  url: img.url,
                  filename: img.filename || img.url.split('/').pop(),
                  isNew: false
                };
              }
              
              // If URL is relative but has a filename, construct the full URL
              if (img.filename) {
                const filename = img.filename.includes('/') ? img.filename.split('/').pop() : img.filename;
                const url = `${baseUrl}/${product.id}/${encodeURIComponent(filename)}`;
                return {
                  id: img.id || url,
                  url: url,
                  filename: filename,
                  isNew: false
                };
              }
            }
            
            // Handle string paths
            if (typeof img === 'string') {
              const filename = img.split('/').pop(); // Extract just the filename
              const url = `${baseUrl}/${product.id}/${encodeURIComponent(filename)}`;
              return {
                id: img,
                url: url,
                filename: filename,
                isNew: false
              };
            }
            
            console.warn('Unhandled image format:', img);
            return null;
            
            return {
              id: img.id || url,
              url: url,
              filename: filename,
              isNew: false
            };
          } catch (error) {
            console.error('Error processing image:', img, error);
            return null;
          }
        }).filter(Boolean); // Remove any null/undefined entries
        
        console.log('Setting image previews:', previews);
        setImagePreviews(previews);
      }
    }
  }, [product]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setFormData(prev => {
      const categoryIndex = prev.categories.findIndex(c => c.id === category.id);
      let newCategories;
      
      if (categoryIndex === -1) {
        // Add category if not already selected
        newCategories = [...prev.categories, category];
      } else {
        // Remove category if already selected (toggle)
        newCategories = prev.categories.filter((_, i) => i !== categoryIndex);
      }
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  // Handle drag events for file upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  // Process uploaded files
  const handleFiles = (files) => {
    const newPreviews = [...imagePreviews];
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.match('image.*')) return;
      
      // Check if we've reached max images (5)
      if (newPreviews.length >= 5) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        newPreviews.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: e.target.result,
          file: file,
          isNew: true
        });
        
        setImagePreviews([...newPreviews]);
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Remove an image
  const removeImage = (id) => {
    setImagePreviews(prev => prev.filter(img => img.id !== id));
  };

  // Reorder images
  const moveImage = (dragIndex, hoverIndex) => {
    const draggedItem = imagePreviews[dragIndex];
    const newPreviews = [...imagePreviews];
    newPreviews.splice(dragIndex, 1);
    newPreviews.splice(hoverIndex, 0, draggedItem);
    setImagePreviews(newPreviews);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare form data for submission
    const formDataToSend = new FormData();
    
    // Add product data
    formDataToSend.append('name', formData.name);
    formDataToSend.append('german_name', formData.german_name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('is_active', formData.is_active);
    
    // Add categories as an array
    if (Array.isArray(formData.categories)) {
      formData.categories.forEach((category, index) => {
        formDataToSend.append(`categories[${index}]`, JSON.stringify(category));
      });
    }
    
    // Add image order
    formDataToSend.append('image_order', JSON.stringify(imagePreviews.map(img => img.isNew ? img.file.name : img.id)));
    
    // Add new images
    imagePreviews
      .filter(img => img.isNew && img.file)
      .forEach((img, index) => {
        formDataToSend.append(`images[${index}]`, img.file);
      });
    
    // Call the onSave handler with the form data
    onSave(formDataToSend);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {product.id ? 'Edit Product' : 'Add New Product'}
      </h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Product Name */}
          <div className="sm:col-span-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name (English) *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* German Name */}
          <div className="sm:col-span-4">
            <label htmlFor="german_name" className="block text-sm font-medium text-gray-700">
              German Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="german_name"
                id="german_name"
                value={formData.german_name}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Price */}
          <div className="sm:col-span-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (USD) *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="price"
                id="price"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm" id="price-currency">
                  USD
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories *
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const isSelected = formData.categories.some(c => c.id === category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isSelected 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category.name_en}
                  </button>
                );
              })}
            </div>
            {formData.categories.length === 0 && (
              <p className="mt-1 text-sm text-red-600">At least one category is required</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images *
            </label>
            
            {/* Image Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {imagePreviews.map((img, index) => (
                  <div 
                    key={img.id}
                    className="relative group rounded-md overflow-hidden border border-gray-200"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      if (dragIndex !== index) {
                        moveImage(dragIndex, index);
                      }
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                      {index === 0 ? 'Primary' : `Image ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* File Upload Dropzone */}
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload images</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </p>
                <p className="text-xs text-gray-500">
                  First image will be used as the main product image
                </p>
              </div>
            </div>
            {imagePreviews.length === 0 && (
              <p className="mt-1 text-sm text-red-600">At least one image is required</p>
            )}
          </div>

          {/* Active Status */}
          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active (visible to customers)
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || formData.categories.length === 0 || imagePreviews.length === 0}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isLoading || formData.categories.length === 0 || imagePreviews.length === 0
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
