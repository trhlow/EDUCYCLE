import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { productsApi, transactionsApi } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardOverview() {
  const { user } = useAuth();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await productsApi.getAll();
      return data;
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        const { data } = await transactionsApi.getAll();
        return data;
      } catch {
        return [];
      }
    },
  });

  const myProducts = products.filter((p) => p.userId === user?.userId);
  const myPurchases = transactions.filter((t) => t.buyerId === user?.userId);
  const mySales = transactions.filter((t) => t.sellerId === user?.userId);
  const totalEarnings = mySales.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Welcome back! 👋
      </h1>
      <p className="text-gray-500 mb-8">{user?.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FiPackage size={24} />}
          label="My Courses"
          value={myProducts.length}
          color="primary"
        />
        <StatCard
          icon={<FiDollarSign size={24} />}
          label="Total Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          color="secondary"
        />
        <StatCard
          icon={<FiShoppingBag size={24} />}
          label="Purchases"
          value={myPurchases.length}
          color="accent"
        />
      </div>

      {/* My Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
        </div>
        {myProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You haven't created any courses yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProducts.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-primary-600 font-semibold">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ${t.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-green-50 text-green-600',
    accent: 'bg-accent-50 text-accent-600',
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
