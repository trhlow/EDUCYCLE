import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiPackage, FiDollarSign, FiTag } from 'react-icons/fi';
import { productsApi, transactionsApi, categoriesApi, reviewsApi } from '../../api/endpoints';

export default function AdminDashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const { data } = await productsApi.getAll(); return data; },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => { try { const { data } = await transactionsApi.getAll(); return data; } catch { return []; } },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await categoriesApi.getAll(); return data; },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => { const { data } = await reviewsApi.getAll(); return data; },
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiPackage size={24} />}
          label="Products"
          value={products.length}
          color="blue"
        />
        <StatCard
          icon={<FiDollarSign size={24} />}
          label="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          color="green"
        />
        <StatCard
          icon={<FiTag size={24} />}
          label="Categories"
          value={categories.length}
          color="purple"
        />
        <StatCard
          icon={<FiUsers size={24} />}
          label="Reviews"
          value={reviews.length}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-primary-600">${p.price.toFixed(2)}</span>
              </div>
            ))}
            {products.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No products yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">${t.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No transactions yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
