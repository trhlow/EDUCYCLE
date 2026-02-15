import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi } from '../api/endpoints';
import './TransactionsPage.css';

const STATUS_CONFIG = {
  Pending: { label: 'Chờ xác nhận', color: 'warning', icon: '⏳' },
  Accepted: { label: 'Đã chấp nhận', color: 'info', icon: '✅' },
  Meeting: { label: 'Đang gặp mặt', color: 'primary', icon: '🤝' },
  Completed: { label: 'Hoàn thành', color: 'success', icon: '🎉' },
  AutoCompleted: { label: 'Tự động hoàn thành', color: 'success', icon: '⏰' },
  Rejected: { label: 'Từ chối', color: 'error', icon: '❌' },
  Cancelled: { label: 'Đã hủy', color: 'neutral', icon: '🚫' },
  Disputed: { label: 'Tranh chấp', color: 'error', icon: '⚠️' },
};

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'buying', label: 'Đang mua' },
  { key: 'selling', label: 'Đang bán' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'Pending', label: 'Chờ xác nhận' },
  { key: 'Accepted', label: 'Đã chấp nhận' },
  { key: 'Meeting', label: 'Đang gặp mặt' },
  { key: 'Completed', label: 'Hoàn thành' },
  { key: 'Rejected', label: 'Từ chối' },
  { key: 'Cancelled', label: 'Đã hủy' },
];

// Mock data - sẽ thay bằng API thật khi backend sẵn sàng
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    product: { id: 1, name: 'Giáo trình Toán Cao Cấp A1', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop', price: 45000 },
    buyer: { id: 2, username: 'nguyenvana' },
    seller: { id: 1, username: 'tranthib' },
    status: 'Pending',
    createdAt: '2026-02-14T10:30:00',
    updatedAt: '2026-02-14T10:30:00',
  },
  {
    id: 2,
    product: { id: 2, name: 'Sách Lập trình C++ Cơ bản', imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=200&fit=crop', price: 55000 },
    buyer: { id: 1, username: 'tranthib' },
    seller: { id: 3, username: 'levanc' },
    status: 'Accepted',
    createdAt: '2026-02-13T14:00:00',
    updatedAt: '2026-02-13T16:00:00',
  },
  {
    id: 3,
    product: { id: 3, name: 'Đồng phục Đại học Bách Khoa', imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&h=200&fit=crop', price: 120000 },
    buyer: { id: 4, username: 'phamthid' },
    seller: { id: 1, username: 'tranthib' },
    status: 'Completed',
    createdAt: '2026-02-10T09:00:00',
    updatedAt: '2026-02-11T15:30:00',
    rating: 5,
  },
  {
    id: 4,
    product: { id: 4, name: 'Máy tính Casio fx-580VN X', imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop', price: 200000 },
    buyer: { id: 1, username: 'tranthib' },
    seller: { id: 5, username: 'hoangvane' },
    status: 'Meeting',
    createdAt: '2026-02-14T08:00:00',
    updatedAt: '2026-02-14T12:00:00',
  },
  {
    id: 5,
    product: { id: 5, name: 'Vở ghi chép Vật lý Đại cương', imageUrl: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=200&h=200&fit=crop', price: 25000 },
    buyer: { id: 6, username: 'dangthif' },
    seller: { id: 1, username: 'tranthib' },
    status: 'Rejected',
    createdAt: '2026-02-12T11:00:00',
    updatedAt: '2026-02-12T14:00:00',
  },
];

export default function TransactionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getMyTransactions();
      setTransactions(res.data);
    } catch {
      // Fallback to mock data khi chưa có backend
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    // Tab filter
    if (activeTab === 'buying' && tx.buyer?.id !== user?.id) return false;
    if (activeTab === 'selling' && tx.seller?.id !== user?.id) return false;
    // Status filter
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    return true;
  });

  const getRole = (tx) => {
    if (tx.buyer?.id === user?.id) return 'buyer';
    if (tx.seller?.id === user?.id) return 'seller';
    return 'unknown';
  };

  const handleQuickAction = async (txId, action) => {
    try {
      await transactionsApi.updateStatus(txId, { status: action });
      toast.success(
        action === 'Accepted' ? 'Đã chấp nhận yêu cầu!' :
        action === 'Rejected' ? 'Đã từ chối yêu cầu.' :
        action === 'Cancelled' ? 'Đã hủy giao dịch.' : 'Cập nhật thành công!'
      );
      fetchTransactions();
    } catch {
      // Mock update
      setTransactions(prev =>
        prev.map(tx => tx.id === txId ? { ...tx, status: action } : tx)
      );
      toast.success('Cập nhật thành công!');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter(tx => tx.status === 'Pending').length,
    active: transactions.filter(tx => ['Accepted', 'Meeting'].includes(tx.status)).length,
    completed: transactions.filter(tx => ['Completed', 'AutoCompleted'].includes(tx.status)).length,
  };

  if (loading) {
    return (
      <div className="tx-page">
        <div className="tx-container">
          <div className="tx-loading">
            <div className="loading-spinner" />
            <p>Đang tải giao dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page">
      <div className="tx-container">
        {/* Header */}
        <div className="tx-header">
          <div>
            <h1 className="tx-title">Giao dịch của tôi</h1>
            <p className="tx-subtitle">Quản lý tất cả giao dịch mua bán tài liệu học tập</p>
          </div>
          <Link to="/transactions/guide" className="tx-guide-btn">
            📖 Hướng dẫn giao dịch
          </Link>
        </div>

        {/* Stats */}
        <div className="tx-stats">
          <div className="tx-stat-card">
            <div className="tx-stat-value">{stats.total}</div>
            <div className="tx-stat-label">Tổng giao dịch</div>
          </div>
          <div className="tx-stat-card tx-stat-warning">
            <div className="tx-stat-value">{stats.pending}</div>
            <div className="tx-stat-label">Chờ xác nhận</div>
          </div>
          <div className="tx-stat-card tx-stat-info">
            <div className="tx-stat-value">{stats.active}</div>
            <div className="tx-stat-label">Đang xử lý</div>
          </div>
          <div className="tx-stat-card tx-stat-success">
            <div className="tx-stat-value">{stats.completed}</div>
            <div className="tx-stat-label">Hoàn thành</div>
          </div>
        </div>

        {/* Filters */}
        <div className="tx-filters">
          <div className="tx-tabs">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                className={`tx-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            className="tx-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="tx-empty">
            <div className="tx-empty-icon">📦</div>
            <h3>Không có giao dịch nào</h3>
            <p>Hãy bắt đầu bằng cách duyệt sản phẩm và gửi yêu cầu mua!</p>
            <Link to="/products" className="tx-empty-btn">Duyệt sản phẩm</Link>
          </div>
        ) : (
          <div className="tx-list">
            {filteredTransactions.map((tx) => {
              const role = getRole(tx);
              const config = STATUS_CONFIG[tx.status] || STATUS_CONFIG.Pending;
              const otherUser = role === 'buyer' ? tx.seller : tx.buyer;

              return (
                <div key={tx.id} className="tx-card">
                  <div className="tx-card-left">
                    <div className="tx-card-image">
                      <img src={tx.product?.imageUrl} alt={tx.product?.name} />
                    </div>
                    <div className="tx-card-info">
                      <h3 className="tx-card-product-name">{tx.product?.name}</h3>
                      <div className="tx-card-meta">
                        <span className={`tx-role-badge tx-role-${role}`}>
                          {role === 'buyer' ? '🛒 Người mua' : '📦 Người bán'}
                        </span>
                        <span className="tx-card-with">
                          với <strong>@{otherUser?.username}</strong>
                        </span>
                      </div>
                      <div className="tx-card-date">
                        {formatDate(tx.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="tx-card-right">
                    <div className="tx-card-price">{formatPrice(tx.product?.price)}</div>
                    <span className={`tx-status-badge tx-status-${config.color}`}>
                      {config.icon} {config.label}
                    </span>

                    <div className="tx-card-actions">
                      {/* Quick actions based on role + status */}
                      {role === 'seller' && tx.status === 'Pending' && (
                        <>
                          <button
                            className="tx-action-btn tx-action-accept"
                            onClick={() => handleQuickAction(tx.id, 'Accepted')}
                          >
                            ✅ Chấp nhận
                          </button>
                          <button
                            className="tx-action-btn tx-action-reject"
                            onClick={() => handleQuickAction(tx.id, 'Rejected')}
                          >
                            ❌ Từ chối
                          </button>
                        </>
                      )}

                      {role === 'buyer' && tx.status === 'Pending' && (
                        <button
                          className="tx-action-btn tx-action-cancel"
                          onClick={() => handleQuickAction(tx.id, 'Cancelled')}
                        >
                          🚫 Hủy yêu cầu
                        </button>
                      )}

                      <Link to={`/transactions/${tx.id}`} className="tx-action-btn tx-action-detail">
                        Chi tiết →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
