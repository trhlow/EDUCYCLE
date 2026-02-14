import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { productsApi, categoriesApi } from '../api/endpoints';
import { useCart } from '../contexts/CartContext';

export default function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCart();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await productsApi.getAll();
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesApi.getAll();
      return data;
    },
  });

  // Filter & sort
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === parseInt(selectedCategory);

      let matchesPrice = true;
      if (priceRange === 'under50') matchesPrice = product.price < 50;
      else if (priceRange === '50to75') matchesPrice = product.price >= 50 && product.price < 75;
      else if (priceRange === 'over75') matchesPrice = product.price >= 75;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('newest');
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 text-center">
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Discover Your Next Learning Adventure
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Access thousands of courses from expert educators worldwide
        </p>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Filters</h3>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'under50', label: 'Under $50' },
                    { value: '50to75', label: '$50 - $75' },
                    { value: 'over75', label: 'Over $75' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 accent-primary-500"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-2.5 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Product Area */}
          <main>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div className="flex-1 min-w-[250px] relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>

              <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 cursor-pointer transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 cursor-pointer transition-colors ${
                    viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <FiList size={18} />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium cursor-pointer"
              >
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 font-medium mb-4">
              Showing {filteredProducts.length} of {products.length} courses
            </p>

            {/* Loading */}
            {productsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                    <div className="skeleton h-48" />
                    <div className="p-5 space-y-3">
                      <div className="skeleton h-5 w-3/4 rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-4 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {!productsLoading && filteredProducts.length > 0 && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    categories={categories}
                    onAddToCart={() => addItem(product)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!productsLoading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode, categories, onAddToCart }) {
  const categoryName = categories.find((c) => c.id === product.categoryId)?.name || 'General';

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer grid grid-cols-[200px_1fr]">
        <Link to={`/products/${product.id}`} className="no-underline">
          <div className="h-full bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
            )}
          </div>
        </Link>
        <div className="p-5 flex flex-col">
          <Link to={`/products/${product.id}`} className="no-underline">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 flex-1 mb-3 line-clamp-2">
            {product.description || 'No description available'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              className="px-5 py-2 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer flex flex-col">
      <Link to={`/products/${product.id}`} className="no-underline">
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">📚</div>
          )}
          <span className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full text-xs font-semibold text-primary-600">
            {categoryName}
          </span>
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="no-underline">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 flex-1 mb-4 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-2xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
            className="px-5 py-2 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
