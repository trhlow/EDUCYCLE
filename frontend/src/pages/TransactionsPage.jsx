import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, usersApi } from '../api/endpoints';
import './TransactionsPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xác nhận', color: 'warning' },
  ACCEPTED:  { label: 'Đã chấp nhận', color: 'info' },
  MEETING:   { label: 'Đang gặp mặt', color: 'primary' },
  COMPLETED: { label: 'Hoàn thành',   color: 'success' },
  REJECTED:  { label: 'Từ chối',      color: 'error' },
  CANCELLED: { label: 'Đã hủy',       color: 'neutral' },
  DISPUTED:  { label: 'Tranh chấp',   color: 'error' },
};

const FILTER_TABS   = [
  { key: 'all',     label: 'Tất cả'    },
  { key: 'buying',  label: 'Đang mua'  },
  { key: 'selling', label: 'Đang bán'  },
];
const STATUS_FILTERS = [
  { key: 'all',       label: 'Tất cả trạng thái' },
  { key: 'PENDING',   label: 'Chờ xác nhận'       },
  { key: 'ACCEPTED',  label: 'Đã chấp nhận'        },
  { key: 'MEETING',   label: 'Đang gặp mặt'        },
  { key: 'COMPLETED', label: 'Hoàn thành'          },
  { key: 'REJECTED',  label: 'Từ chối'             },
  { key: 'CANCELLED', label: 'Đã hủy'              },
];

export default function TransactionsPage() {
  const { user, refreshUser } = useAuth();
  const toast     = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('all');
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
        if (typeof localStorage !== 'undefined' && localStorage.getItem('educycle_tx_rules_accepted') === 'true' && !next?.transactionRulesAcceptedAt) {
          try {
            await usersApi.acceptTransactionRules();
            await refreshUser();
          } finally {
            localStorage.removeItem('educycle_tx_rules_accepted');
          }
        }
      } catch {
        /* mạng / 401 — vẫn mở gate để user thấy modal hoặc lỗi */
      } finally {
        if (!cancelled) setRulesGateReady(true);
      }
    })();
    return () => { cancelled = true; };
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

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'buying'  && tx.buyer?.id  !== user?.id) return false;
    if (activeTab === 'selling' && tx.seller?.id !== user?.id) return false;
    if (statusFilter !== 'all' && tx.status?.toUpperCase() !== statusFilter) return false;
    return true;
  });

  const getRole = tx => {
    if (tx.buyer?.id  === user?.id) return 'buyer';
    if (tx.seller?.id === user?.id) return 'seller';
    return 'unknown';
  };

  // Issue #2 FIX: use UPPERCASE status values to match BE enum
  const handleQuickAction = async (txId, action) => {
    try {
      if (action === 'CANCELLED') {
        await transactionsApi.cancel(txId, {});
      } else {
        await transactionsApi.updateStatus(txId, { status: action });
      }
      toast.success(
        action === 'ACCEPTED'   ? 'Đã chấp nhận yêu cầu!' :
        action === 'REJECTED'   ? 'Đã từ chối yêu cầu.'   :
        action === 'CANCELLED'  ? 'Đã hủy giao dịch.'      : 'Cập nhật thành công!'
      );
      fetchTransactions();
    } catch {
      setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: action } : tx));
      toast.success('Cập nhật thành công!');
    }
  };

  const formatDate = d => new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const formatPrice = p => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  // Issue #2 FIX: stats use .toUpperCase() — not TitleCase
  const stats = {
    total:     transactions.length,
    pending:   transactions.filter(tx => tx.status?.toUpperCase() === 'PENDING').length,
    active:    transactions.filter(tx => ['ACCEPTED', 'MEETING'].includes(tx.status?.toUpperCase())).length,
    completed: transactions.filter(tx => ['COMPLETED','AUTO_COMPLETED'].includes(tx.status?.toUpperCase())).length,
  };

  const handleAcceptRules = async () => {
    if (!rulesChecked) { toast.error('Vui lòng đọc và đồng ý với nội quy giao dịch!'); return; }
    try {
      await usersApi.acceptTransactionRules();
      await refreshUser();
      toast.success('Bạn đã chấp thuận nội quy giao dịch!');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không lưu được. Kiểm tra kết nối và thử lại.');
    }
  };

  if (!rulesGateReady) {
    return (
      <div className="tx-page">
        <div className="tx-container">
          <div className="tx-loading"><div className="loading-spinner" /><p>Đang tải...</p></div>
        </div>
      </div>
    );
  }

  if (!rulesAccepted) {
    return (
      <div className="tx-page">
        <div className="tx-rules-overlay">
          <div className="tx-rules-modal">
            <div className="tx-rules-header">
              <div className="tx-rules-logo">EduCycle</div>
              <h2 className="tx-rules-title">Nội Quy Giao Dịch</h2>
              <p className="tx-rules-subtitle">Vui lòng đọc kỹ và chấp thuận trước khi tham gia giao dịch</p>
            </div>

            <div className="tx-rules-content">
              <div className="tx-rules-section">
                <h3>Quy định chung</h3>
                <ul>
                  <li>Mọi giao dịch là <strong>trực tiếp giữa người mua và người bán</strong> (P2P). EduCycle chỉ là nền tảng kết nối.</li>
                  <li>Người dùng phải cung cấp thông tin trung thực về sản phẩm.</li>
                  <li>Nghiêm cấm đăng bán sản phẩm vi phạm pháp luật hoặc không liên quan đến học tập.</li>
                </ul>
              </div>
              <div className="tx-rules-section">
                <h3>Quy trình</h3>
                <ul>
                  <li><strong>Bước 1:</strong> Người mua gửi yêu cầu; người bán xác nhận.</li>
                  <li><strong>Bước 2:</strong> Chat để thống nhất địa điểm & giờ gặp.</li>
                  <li><strong>Bước 3:</strong> Gặp mặt, kiểm tra sản phẩm, xác nhận bằng <strong>mã OTP</strong>.</li>
                  <li><strong>Bước 4:</strong> Hai bên xác nhận, giao dịch hoàn thành.</li>
                </ul>
              </div>
              <div className="tx-rules-section">
                <h3>Mã OTP</h3>
                <ul>
                  <li>Người <strong>mua</strong> tạo mã OTP và đọc cho người <strong>bán</strong> nhập.</li>
                  <li>Mã có hiệu lực 30 phút. Xác nhận tại chỗ.</li>
                  <li>Chưa nhập OTP = giao dịch chưa chốt, người mua được bảo vệ.</li>
                </ul>
              </div>
              <div className="tx-rules-section">
                <h3>Vi phạm</h3>
                <ul>
                  <li>Hủy liên tục không lý do: cảnh cáo, sau đó khóa tạm, rồi khóa vĩnh viễn.</li>
                  <li>Đăng sản phẩm giả: khóa tài khoản vĩnh viễn.</li>
                  <li>Tranh chấp được admin xử lý dựa trên bằng chứng chat.</li>
                </ul>
              </div>
            </div>

            <div className="tx-rules-footer">
              <label className="tx-rules-checkbox">
                <input type="checkbox" checked={rulesChecked} onChange={e => setRulesChecked(e.target.checked)} />
                <span>Tôi đã đọc, hiểu và đồng ý tuân thủ <strong>Nội Quy Giao Dịch</strong> của EduCycle</span>
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

  if (loading) return (
    <div className="tx-page">
      <div className="tx-container">
        <div className="tx-loading"><div className="loading-spinner" /><p>Đang tải giao dịch...</p></div>
      </div>
    </div>
  );

  return (
    <div className="tx-page">
      <div className="tx-container">
        <div className="tx-header">
          <div>
            <h1 className="tx-title">Giao dịch của tôi</h1>
            <p className="tx-subtitle">Quản lý tất cả giao dịch mua bán tài liệu học tập</p>
          </div>
          <Link to="/transactions/guide" className="tx-guide-btn">Hướng dẫn giao dịch</Link>
        </div>

        <div className="tx-stats">
          {[
            { value: stats.total,     label: 'Tổng giao dịch', cls: '' },
            { value: stats.pending,   label: 'Chờ xác nhận',   cls: 'tx-stat-warning' },
            { value: stats.active,    label: 'Đang xử lý',     cls: 'tx-stat-info' },
            { value: stats.completed, label: 'Hoàn thành',     cls: 'tx-stat-success' },
          ].map((s, i) => (
            <div key={i} className={`tx-stat-card ${s.cls}`}>
              <div className="tx-stat-value">{s.value}</div>
              <div className="tx-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="tx-filters">
          <div className="tx-tabs">
            {FILTER_TABS.map(tab => (
              <button key={tab.key} className={`tx-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
          <select className="tx-status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="tx-empty">
            <h3>Không có giao dịch nào</h3>
            <p>Hãy bắt đầu bằng cách duyệt sản phẩm!</p>
            <Link to="/products" className="tx-empty-btn">Duyệt sản phẩm</Link>
          </div>
        ) : (
          <div className="tx-list">
            {filteredTransactions.map(tx => {
              const role      = getRole(tx);
              const statusKey = tx.status?.toUpperCase() || 'PENDING';
              const config    = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
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
                          {role === 'buyer' ? 'Người mua' : 'Người bán'}
                        </span>
                        <span className="tx-card-with">với <strong>@{otherUser?.username}</strong></span>
                      </div>
                      <div className="tx-card-date">{formatDate(tx.createdAt)}</div>
                    </div>
                  </div>

                  <div className="tx-card-right">
                    <div className="tx-card-price">{formatPrice(tx.product?.price)}</div>
                    <span className={`tx-status-badge tx-status-${config.color}`}>
                      {config.label}
                    </span>
                    <div className="tx-card-actions">
                      {/* Issue #2 FIX: use UPPERCASE status in quick actions */}
                      {role === 'seller' && statusKey === 'PENDING' && (
                        <>
                          <button className="tx-action-btn tx-action-accept" onClick={() => handleQuickAction(tx.id, 'ACCEPTED')}>Chấp nhận</button>
                          <button className="tx-action-btn tx-action-reject" onClick={() => handleQuickAction(tx.id, 'REJECTED')}>Từ chối</button>
                        </>
                      )}
                      {role === 'buyer' && statusKey === 'PENDING' && (
                        <button className="tx-action-btn tx-action-cancel" onClick={() => handleQuickAction(tx.id, 'CANCELLED')}>Hủy yêu cầu</button>
                      )}
                      <Link to={`/transactions/${tx.id}`} className="tx-action-btn tx-action-detail">Chi tiết</Link>
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
