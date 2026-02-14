import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { transactionsApi } from '../api/endpoints';
import toast from 'react-hot-toast';
import { FiCheck, FiLock } from 'react-icons/fi';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Create transactions for each item
      for (const item of items) {
        await transactionsApi.create({
          sellerId: item.userId,
          amount: item.price,
        });
      }
      setOrderComplete(true);
      setStep(3);
      clearCart();
      toast.success('Purchase completed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 animate-scale-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck size={40} className="text-green-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. You can access your courses from the dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard/purchases')}
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all cursor-pointer"
          >
            My Purchases
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[
          { num: 1, label: 'Review' },
          { num: 2, label: 'Payment' },
          { num: 3, label: 'Confirmation' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.num
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= s.num ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
            {s.num < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Main Content */}
        <div>
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-md animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Order</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">📚</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all cursor-pointer"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-md animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Billing Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, City, State"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
                <FiLock size={14} />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
