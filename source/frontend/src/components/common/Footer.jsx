import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎓</span>
              <span className="font-display text-xl font-extrabold text-white">
                EduCycle
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your marketplace for educational excellence. Buy, sell, and discover the best
              educational resources from expert educators worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white text-sm transition-colors no-underline">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors no-underline">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white text-sm transition-colors no-underline">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Help Center</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Terms of Service</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} EduCycle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
