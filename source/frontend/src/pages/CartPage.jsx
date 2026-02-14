import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some courses to get started!</p>
        <Link
          to="/products"
          className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all no-underline inline-flex items-center gap-2"
        >
          <FiShoppingBag size={18} />
          Browse Courses
        </Link>
      </div>
    );
  }

  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/products" className="text-gray-500 hover:text-primary-600 transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
          Shopping Cart ({itemCount} items)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-md flex gap-4 items-center animate-slide-up"
            >
              <div className="w-24 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.id}`}
                  className="font-semibold text-gray-900 hover:text-primary-600 transition-colors no-underline block truncate"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 truncate">
                  {item.description || 'Digital course'}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-primary-600">${item.price.toFixed(2)}</p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                title="Remove item"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full py-3.5 mt-6 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all text-center no-underline"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="block text-center mt-3 text-sm text-primary-600 font-medium hover:underline no-underline"
            >
              Continue Shopping
            </Link>

            <button
              onClick={clearCart}
              className="w-full mt-3 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
