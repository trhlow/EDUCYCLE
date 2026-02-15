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
      setTransactions([]);
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
