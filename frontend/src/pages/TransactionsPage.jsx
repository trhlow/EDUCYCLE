import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, usersApi } from '../api/endpoints';
import {
  EmptyState,
  PageHeader,
  SegmentedControl,
  StatusBadge,
  SurfaceCard,
} from '../components/ui';
import './TransactionsPage.css';

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'buying', label: 'Đang mua' },
  { key: 'selling', label: 'Đang bán' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'ACCEPTED', label: 'Đã chấp nhận' },
  { key: 'MEETING', label: 'Đang gặp mặt' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'REJECTED', label: 'Từ chối' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

export default function TransactionsPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rulesGateReady, setRulesGateReady] = useState(false);
  const [rulesChecked, setRulesChecked] = useState(false);

  const rulesAccepted = Boolean(user?.transactionRulesAcceptedAt);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const next = await refreshUser();
        if (cancelled) return;

        if (
          typeof localStorage !== 'undefined' &&
          localStorage.getItem('educycle_tx_rules_accepted') === 'true' &&
          !next?.transactionRulesAcceptedAt
        ) {
          try {
            await usersApi.acceptTransactionRules();
            await refreshUser();
          } finally {
            localStorage.removeItem('educycle_tx_rules_accepted');
          }
        }
      } catch {
        // ignore network/auth noise here
      } finally {
        if (!cancelled) setRulesGateReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getMyTransactions();
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!rulesGateReady || !rulesAccepted) return;
    fetchTransactions();
  }, [rulesGateReady, rulesAccepted, fetchTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'buying' && tx.buyer?.id !== user?.id) return false;
    if (activeTab === 'selling' && tx.seller?.id !== user?.id) return false;
    if (statusFilter !== 'all' && tx.status?.toUpperCase() !== statusFilter) return false;
    return true;
  });

  const getRole = (tx) => {
    if (tx.buyer?.id === user?.id) return 'buyer';
    if (tx.seller?.id === user?.id) return 'seller';
    return 'unknown';
  };

  const handleQuickAction = async (txId, action) => {
    try {
      if (action === 'CANCELLED') {
        await transactionsApi.cancel(txId, {});
      } else {
        await transactionsApi.updateStatus(txId, { status: action });
      }

      toast.success(
        action === 'ACCEPTED'
          ? 'Đã chấp nhận yêu cầu.'
          : action === 'REJECTED'
            ? 'Đã từ chối yêu cầu.'
            : action === 'CANCELLED'
              ? 'Đã hủy giao dịch.'
              : 'Cập nhật thành công.',
      );

      fetchTransactions();
    } catch {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === txId ? { ...tx, status: action } : tx)),
      );
      toast.success('Cập nhật thành công.');
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);

  const stats = {
    total: transactions.length,
    pending: transactions.filter((tx) => tx.status?.toUpperCase() === 'PENDING').length,
    active: transactions.filter((tx) => ['ACCEPTED', 'MEETING'].includes(tx.status?.toUpperCase()))
      .length,
    completed: transactions.filter((tx) =>
      ['COMPLETED', 'AUTO_COMPLETED'].includes(tx.status?.toUpperCase()),
    ).length,
  };

  const handleAcceptRules = async () => {
    if (!rulesChecked) {
      toast.error('Vui lòng đọc và đồng ý với nội quy giao dịch.');
      return;
    }

    try {
      await usersApi.acceptTransactionRules();
      await refreshUser();
      toast.success('Bạn đã chấp thuận nội quy giao dịch.');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không lưu được nội quy.');
    }
  };

  if (!rulesGateReady) {
    return (
      <div className="tx-page edu-page">
        <div className="tx-container edu-container">
          <div className="tx-loading">
            <div className="loading-spinner" />
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rulesAccepted) {
    return (
      <div className="tx-page edu-page">
        <div className="tx-rules-overlay">
          <div className="tx-rules-modal">
            <div className="tx-rules-header">
              <div className="tx-rules-logo">EduCycle</div>
              <h2 className="tx-rules-title">Nội Quy Giao Dịch</h2>
              <p className="tx-rules-subtitle">
                Vui lòng đọc kỹ trước khi bắt đầu mua bán trên nền tảng.
              </p>
            </div>

            <div className="tx-rules-content">
              <div className="tx-rules-section">
                <h3>Quy định chung</h3>
                <ul>
                  <li>Mọi giao dịch là trực tiếp giữa người mua và người bán (P2P).</li>
                  <li>Thông tin sản phẩm phải trung thực và đúng mô tả.</li>
                  <li>Nghiêm cấm sản phẩm không liên quan học tập hoặc vi phạm pháp luật.</li>
                </ul>
              </div>
              <div className="tx-rules-section">
                <h3>Quy trình</h3>
                <ul>
                  <li>Bước 1: Người mua gửi yêu cầu, người bán xác nhận.</li>
                  <li>Bước 2: Hai bên thống nhất thời gian, địa điểm gặp.</li>
                  <li>Bước 3: Xác nhận OTP tại chỗ để hoàn tất giao dịch.</li>
                </ul>
              </div>
              <div className="tx-rules-section">
                <h3>Bảo vệ giao dịch</h3>
                <ul>
                  <li>OTP do người mua tạo và chỉ dùng trong buổi gặp mặt.</li>
                  <li>Không chia sẻ OTP trong chat nếu chưa nhận hàng.</li>
                  <li>Tranh chấp sẽ được admin xử lý dựa trên lịch sử trao đổi.</li>
                </ul>
              </div>
            </div>

            <div className="tx-rules-footer">
              <label className="tx-rules-checkbox">
                <input
                  type="checkbox"
                  checked={rulesChecked}
                  onChange={(event) => setRulesChecked(event.target.checked)}
                />
                <span>
                  Tôi đã đọc, hiểu và đồng ý tuân thủ <strong>Nội Quy Giao Dịch EduCycle</strong>
                </span>
              </label>
              <button
                className={`tx-rules-accept-btn ${rulesChecked ? 'enabled' : ''}`}
                onClick={handleAcceptRules}
                disabled={!rulesChecked}
              >
                Chấp thuận và tiếp tục
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tx-page edu-page">
        <div className="tx-container edu-container">
          <div className="tx-loading">
            <div className="loading-spinner" />
            <p>Đang tải giao dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page edu-page">
      <div className="tx-container edu-container">
        <PageHeader
          eyebrow="EduCycle Secure Flow"
          title="Giao dịch của tôi"
          subtitle="Theo dõi đầy đủ các phiên giao dịch, trạng thái OTP và lịch sử trao đổi với đối tác."
          actions={
            <Link to="/transactions/guide" className="tx-guide-btn">
              Hướng dẫn giao dịch
            </Link>
          }
        />

        <div className="tx-stats">
          <SurfaceCard className="tx-stat-card tx-stat-primary" interactive>
            <div className="tx-stat-value">{stats.total}</div>
            <div className="tx-stat-label">Tổng giao dịch</div>
          </SurfaceCard>
          <SurfaceCard className="tx-stat-card tx-stat-warning" interactive>
            <div className="tx-stat-value">{stats.pending}</div>
            <div className="tx-stat-label">Chờ xác nhận</div>
          </SurfaceCard>
          <SurfaceCard className="tx-stat-card tx-stat-info" interactive>
            <div className="tx-stat-value">{stats.active}</div>
            <div className="tx-stat-label">Đang xử lý</div>
          </SurfaceCard>
          <SurfaceCard className="tx-stat-card tx-stat-success" interactive>
            <div className="tx-stat-value">{stats.completed}</div>
            <div className="tx-stat-label">Hoàn thành</div>
          </SurfaceCard>
        </div>

        <div className="tx-filters">
          <SegmentedControl options={FILTER_TABS} value={activeTab} onChange={setActiveTab} />
          <select
            className="tx-status-select edu-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.key} value={filter.key}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="Chưa có giao dịch nào"
            description="Bạn có thể bắt đầu bằng cách tìm giáo trình, tài liệu hoặc đồ dùng học tập từ sinh viên khác."
            actions={
              <Link to="/products" className="tx-empty-btn">
                Duyệt sản phẩm
              </Link>
            }
          />
        ) : (
          <div className="tx-list">
            {filteredTransactions.map((tx) => {
              const role = getRole(tx);
              const statusKey = tx.status?.toUpperCase() || 'PENDING';
              const otherUser = role === 'buyer' ? tx.seller : tx.buyer;

              return (
                <SurfaceCard key={tx.id} className="tx-card" interactive padded={false}>
                  <div className="tx-card-left">
                    <div className="tx-card-image">
                      <img
                        src={tx.product?.imageUrl}
                        alt={tx.product?.name}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="tx-card-info">
                      <h3 className="tx-card-product-name">{tx.product?.name}</h3>
                      <div className="tx-card-meta">
                        <span className={`tx-role-badge tx-role-${role}`}>
                          {role === 'buyer' ? 'Người mua' : 'Người bán'}
                        </span>
                        <span className="tx-card-with">
                          với <strong>@{otherUser?.username}</strong>
                        </span>
                      </div>
                      <div className="tx-card-date">{formatDate(tx.createdAt)}</div>
                    </div>
                  </div>

                  <div className="tx-card-right">
                    <div className="tx-card-price">{formatPrice(tx.product?.price)}</div>
                    <StatusBadge status={statusKey} />
                    <div className="tx-card-actions">
                      {role === 'seller' && statusKey === 'PENDING' ? (
                        <>
                          <button
                            className="tx-action-btn tx-action-accept"
                            onClick={() => handleQuickAction(tx.id, 'ACCEPTED')}
                          >
                            Chấp nhận
                          </button>
                          <button
                            className="tx-action-btn tx-action-reject"
                            onClick={() => handleQuickAction(tx.id, 'REJECTED')}
                          >
                            Từ chối
                          </button>
                        </>
                      ) : null}

                      {role === 'buyer' && statusKey === 'PENDING' ? (
                        <button
                          className="tx-action-btn tx-action-cancel"
                          onClick={() => handleQuickAction(tx.id, 'CANCELLED')}
                        >
                          Hủy yêu cầu
                        </button>
                      ) : null}

                      <Link to={`/transactions/${tx.id}`} className="tx-action-btn tx-action-detail">
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}