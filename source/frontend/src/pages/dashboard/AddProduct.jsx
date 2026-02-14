import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

export default function AddProduct() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
  });
  const [errors, setErrors] = useState({});

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesApi.getAll();
      return data;
    },
  });

  const { data: existingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await productsApi.getById(id);
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name || '',
        description: existingProduct.description || '',
        price: existingProduct.price?.toString() || '',
        imageUrl: existingProduct.imageUrl || '',
        categoryId: existingProduct.categoryId?.toString() || '',
      });
    }
  }, [existingProduct]);

  const createMutation = useMutation({
    mutationFn: (data) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      navigate('/dashboard/products');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      navigate('/dashboard/products');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      imageUrl: form.imageUrl.trim() || null,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fade-in max-w-2xl">
      <button
        onClick={() => navigate('/dashboard/products')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-6 cursor-pointer"
      >
        <FiArrowLeft size={18} />
        Back to Products
      </button>

      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Advanced Python Programming"
            className={`w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none focus:border-primary-500 ${
              errors.name ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your product..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-500 resize-vertical"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              className={`w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none focus:border-primary-500 ${
                errors.price ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Image URL</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-500"
          />
          {form.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 max-w-xs">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-auto"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/products')}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
