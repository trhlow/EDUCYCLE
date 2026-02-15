import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { productsApi, transactionsApi } from '../api/endpoints';
import './DashboardPage.css';

const SIDEBAR_ITEMS = [
  { icon: '📊', label: 'Tổng Quan', view: 'overview' },
  { icon: '📚', label: 'Sản Phẩm Của Tôi', view: 'products' },
  { icon: '🛒', label: 'Đã Mua', view: 'purchases' },
  { icon: '💰', label: 'Lịch Sử Bán', view: 'sales' },
  { icon: '⚙️', label: 'Cài Đặt', view: 'settings' },
];

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất');
    navigate('/');
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-user">
          <div className="dash-sidebar-avatar">
            {user?.username?.charAt(0)?.toUpperCase() || '👤'}
          </div>
          <div>
            <div className="dash-sidebar-name">{user?.username || 'Người dùng'}</div>
            <div className="dash-sidebar-email">{user?.email || ''}</div>
          </div>
        </div>

        <div className="dash-sidebar-section">
          <div className="dash-sidebar-section-title">Menu</div>
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.view}
              className={`dash-sidebar-link ${currentView === item.view ? 'active' : ''}`}
              onClick={() => handleViewChange(item.view)}
            >
              <span className="dash-sidebar-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <button className="dash-sidebar-link dash-sidebar-logout" onClick={handleLogout}>
          <span className="dash-sidebar-link-icon">🚪</span>
          Đăng Xuất
        </button>

        {sidebarOpen && (
          <button
            className="dash-sidebar-link"
            onClick={() => setSidebarOpen(false)}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <span className="dash-sidebar-link-icon">✕</span>
            Đóng Menu
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        <button className="dash-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰ Menu
        </button>

        {currentView === 'overview' && <OverviewView user={user} />}
        {currentView === 'products' && <ProductsView />}
        {currentView === 'purchases' && <PurchasesView />}
        {currentView === 'sales' && <SalesView />}
        {currentView === 'settings' && <SettingsView user={user} />}
      </div>
    </div>
  );
}

function OverviewView({ user }) {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, txRes] = await Promise.all([
          productsApi.getMyProducts().catch(() => ({ data: [] })),
          transactionsApi.getMyTransactions().catch(() => ({ data: [] })),
        ]);
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  const completedTx = transactions.filter((tx) => ['Completed', 'AutoCompleted'].includes(tx.status));
  const salesAmount = completedTx
    .filter((tx) => tx.seller?.id === user?.id)
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <>
      <h1 className="dash-welcome">Chào mừng trở lại, {user?.username || 'bạn'}! 👋</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
      ) : (
        <>
          <div className="dash-stats">
            <div className="dash-stat-card">
              <div className="dash-stat-value">{products.length}</div>
              <div className="dash-stat-label">Sản Phẩm</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-value">{formatPrice(salesAmount)}</div>
              <div className="dash-stat-label">Tổng Thu Nhập</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-value">{transactions.length}</div>
              <div className="dash-stat-label">Giao Dịch</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-value">{completedTx.length}</div>
              <div className="dash-stat-label">Hoàn Thành</div>
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Sản Phẩm Của Tôi</h2>
              <Link to="/post-product" className="dash-section-action">+ Đăng Mới</Link>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Bạn chưa đăng sản phẩm nào
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Sản Phẩm</th>
                    <th>Giá</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="dash-table-product">
                          <span className="dash-table-product-icon">📚</span>
                          <span className="dash-table-product-name">{p.name}</span>
                        </div>
                      </td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <span className={`dash-status ${p.status === 'Approved' ? 'dash-status-active' : 'dash-status-draft'}`}>
                          {p.status === 'Approved' ? 'Đã duyệt' : p.status === 'Pending' ? 'Chờ duyệt' : p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dash-section">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Giao Dịch Gần Đây</h2>
              <Link to="/transactions" className="dash-section-action">Xem tất cả</Link>
            </div>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Chưa có giao dịch nào
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Loại</th>
                    <th>Sản Phẩm</th>
                    <th>Số Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx) => {
                    const isBuyer = tx.buyer?.id === user?.id;
                    return (
                      <tr key={tx.id}>
                        <td>{formatDate(tx.createdAt)}</td>
                        <td>
                          <span className={`dash-tx-type ${isBuyer ? 'dash-tx-purchase' : 'dash-tx-sale'}`}>
                            {isBuyer ? 'Mua' : 'Bán'}
                          </span>
                        </td>
                        <td>{tx.product?.name || '—'}</td>
                        <td style={{ color: isBuyer ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
                          {isBuyer ? '-' : '+'}{formatPrice(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await productsApi.getMyProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productsApi.delete(id);
      toast.success('Đã xóa sản phẩm');
      fetchProducts();
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

  return (
    <>
      <h1 className="dash-welcome">Sản Phẩm Của Tôi</h1>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Tất Cả Sản Phẩm ({products.length})</h2>
          <button className="dash-section-action" onClick={() => navigate('/post-product')}>
            + Đăng Sản Phẩm Mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Bạn chưa đăng sản phẩm nào. <Link to="/post-product">Đăng ngay!</Link>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Sản Phẩm</th>
                <th>Trạng Thái</th>
                <th>Giá</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="dash-table-product">
                      <span className="dash-table-product-icon">📚</span>
                      <Link to={`/products/${product.id}`} className="dash-table-product-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className={`dash-status ${product.status === 'Approved' ? 'dash-status-active' : product.status === 'Rejected' ? 'dash-status-draft' : 'dash-status-pending'}`}>
                      {product.status === 'Approved' ? 'Đã Duyệt' : product.status === 'Pending' ? 'Chờ Duyệt' : product.status === 'Rejected' ? 'Bị Từ Chối' : product.status}
                    </span>
                  </td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <div className="dash-table-actions">
                      <button className="dash-table-btn" onClick={() => navigate(`/products/${product.id}`)}>Xem</button>
                      <button className="dash-table-btn dash-table-btn-danger" onClick={() => handleDelete(product.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function PurchasesView() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await transactionsApi.getMyTransactions();
        const data = Array.isArray(res.data) ? res.data : [];
        setTransactions(data.filter((tx) => tx.buyer?.id === user?.id));
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [user?.id]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  const statusMap = {
    Pending: 'Chờ xác nhận', Accepted: 'Đã chấp nhận', Meeting: 'Đang gặp mặt',
    Completed: 'Hoàn thành', AutoCompleted: 'Hoàn thành',
    Rejected: 'Từ chối', Cancelled: 'Đã hủy',
  };

  return (
    <>
      <h1 className="dash-welcome">Đơn Hàng Đã Mua</h1>

      <div className="dash-section">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Bạn chưa mua sản phẩm nào. <Link to="/products">Duyệt sản phẩm</Link>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Sản Phẩm</th>
                <th>Người Bán</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>
                    <Link to={`/transactions/${tx.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {tx.product?.name || '—'}
                    </Link>
                  </td>
                  <td>{tx.seller?.username || '—'}</td>
                  <td>{formatPrice(tx.amount)}</td>
                  <td><span className="dash-status dash-status-active">{statusMap[tx.status] || tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SalesView() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await transactionsApi.getMyTransactions();
        const data = Array.isArray(res.data) ? res.data : [];
        setTransactions(data.filter((tx) => tx.seller?.id === user?.id));
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [user?.id]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  const completedSales = transactions.filter((tx) => ['Completed', 'AutoCompleted'].includes(tx.status));
  const totalRevenue = completedSales.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const statusMap = {
    Pending: 'Chờ xác nhận', Accepted: 'Đã chấp nhận', Meeting: 'Đang gặp mặt',
    Completed: 'Hoàn thành', AutoCompleted: 'Hoàn thành',
    Rejected: 'Từ chối', Cancelled: 'Đã hủy',
  };

  return (
    <>
      <h1 className="dash-welcome">Lịch Sử Bán Hàng</h1>

      <div className="dash-stats" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-value">{formatPrice(totalRevenue)}</div>
          <div className="dash-stat-label">Tổng Doanh Thu</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">{transactions.length}</div>
          <div className="dash-stat-label">Tổng Đơn Bán</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">{completedSales.length}</div>
          <div className="dash-stat-label">Hoàn Thành</div>
        </div>
      </div>

      <div className="dash-section">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Bạn chưa bán sản phẩm nào
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Người Mua</th>
                <th>Sản Phẩm</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>{tx.buyer?.username || '—'}</td>
                  <td>
                    <Link to={`/transactions/${tx.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {tx.product?.name || '—'}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>+{formatPrice(tx.amount)}</td>
                  <td>
                    <span className={`dash-status ${['Completed', 'AutoCompleted'].includes(tx.status) ? 'dash-status-active' : 'dash-status-pending'}`}>
                      {statusMap[tx.status] || tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SettingsView({ user }) {
  const { updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const handleSave = () => {
    updateProfile(form);
    toast.success('Đã lưu thay đổi!');
  };

  return (
    <>
      <h1 className="dash-welcome">Cài Đặt Tài Khoản</h1>

      <div className="dash-section" style={{ padding: 'var(--space-6)' }}>
        <h3 className="dash-section-title" style={{ marginBottom: 'var(--space-6)' }}>Thông Tin Cá Nhân</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
              Họ Và Tên
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
              }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
              Tiểu Sử
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Nhà giáo dục đam mê và người học suốt đời."
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
        <button
          className="dash-section-action"
          style={{ marginTop: 'var(--space-6)' }}
          onClick={handleSave}
        >
          Lưu Thay Đổi
        </button>
      </div>
    </>
  );
}
