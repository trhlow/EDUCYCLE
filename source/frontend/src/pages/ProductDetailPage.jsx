import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiShoppingCart, FiArrowLeft, FiStar } from 'react-icons/fi';
import { productsApi, reviewsApi, categoriesApi } from '../api/endpoints';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await productsApi.getById(id);
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data } = await reviewsApi.getAll();
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

  if (isLoading) return <LoadingSpinner />;
  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/products" className="text-primary-600 font-semibold hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const productReviews = reviews.filter((r) => r.productId === id);
  const categoryName = categories.find((c) => c.id === product.categoryId)?.name || 'General';
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : 'N/A';

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/products" className="hover:text-primary-600 transition-colors no-underline flex items-center gap-1">
            <FiArrowLeft size={14} /> Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Image & Description */}
          <div>
            {/* Image */}
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video mb-8">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">📚</div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description || 'No description available for this course.'}
              </p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reviews ({productReviews.length})
              </h2>
              {productReviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {productReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-accent-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar
                              key={i}
                              size={14}
                              fill={i < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.rating}/5</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Purchase Panel */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-sm font-semibold rounded-full mb-4">
                {categoryName}
              </span>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-accent-500">
                  <FiStar size={16} fill="currentColor" />
                </div>
                <span className="font-semibold text-gray-900">{avgRating}</span>
                <span className="text-gray-500 text-sm">({productReviews.length} reviews)</span>
              </div>

              <div className="text-4xl font-bold text-primary-600 mb-6">
                ${product.price.toFixed(2)}
              </div>

              <button
                onClick={() => addItem(product)}
                className="w-full py-3.5 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg cursor-pointer text-lg flex items-center justify-center gap-2 mb-3"
              >
                <FiShoppingCart size={20} />
                Add to Cart
              </button>

              <Link
                to="/cart"
                onClick={() => addItem(product)}
                className="block w-full py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all text-center no-underline text-lg"
              >
                Buy Now
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">This course includes:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">📖 Full course content</li>
                  <li className="flex items-center gap-2">🔒 Lifetime access</li>
                  <li className="flex items-center gap-2">📱 Mobile friendly</li>
                  <li className="flex items-center gap-2">📜 Certificate of completion</li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center">
                  Created: {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
