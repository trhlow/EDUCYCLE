import { formatPrice, formatDate } from '../utils/format';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { productsApi, transactionsApi } from '../api/endpoints';
import { extractPage } from '../utils/pageApi';
import './DashboardPage.css';

const MY_PRODUCTS_PAGE_SIZE = 100;

// Issue #6 FIX: Dashboard cho TẤT CẢ user (không chỉ admin)
// Admin xem AdminPage (/admin) cho quản trị hệ thống
const SIDEBAR_ITEMS = [
  { label: 'Tổng quan', view: 'overview' },
  { label: 'Sản phẩm của tôi', view: 'products' },
  { label: 'Đã mua', view: 'purchases' },
  { label: 'Lịch sử bán', view: 'sales' },
  { label: 'Cài đặt', view: 'settings' },
];

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Issue #6 FIX: Không redirect — tất cả user đều có dashboard cá nhân
  // Default view: 'products' (sản phẩm của tôi) vì đó là lý do user vào đây

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
            {user?.username?.charAt(0)?.toUpperCase() || '?'}
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
              {item.label}
            </button>
          ))}
          {/* Link đến AdminPage cho admin */}
          {isAdmin && (
            <>
              <div className="dash-sidebar-section-title" style={{ marginTop: 'var(--space-4)' }}>Quản Trị</div>
              <button
                className="dash-sidebar-link"
                onClick={() => navigate('/admin')}
              >
                Trang quản trị
              </button>
            </>
          )}
        </div>

        <button className="dash-sidebar-link dash-sidebar-logout" onClick={handleLogout}>
          Đăng xuất
        </button>

        {sidebarOpen && (
          <button
            className="dash-sidebar-link"
            onClick={() => setSidebarOpen(false)}
            style={{ marginTop: 'var(--space-2)' }}
          >
            Đóng menu
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        <button className="dash-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          Menu
        </button>

        {currentView === 'overview' && <OverviewView user={user} />}
        {currentView === 'products' && <ProductsView />}
        {currentView === 'purchases' && <PurchasesView />}
        {currentView === 'sales' && <SalesView />}
        {currentView === 'settings' && <SettingsView />}
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
          productsApi.getMyProducts({ page: 0, size: MY_PRODUCTS_PAGE_SIZE }).catch(() => ({ data: { content: [] } })),
          transactionsApi.getMyTransactions().catch(() => ({ data: [] })),
        ]);
        setProducts(extractPage(prodRes).content);
        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedTx = transactions.filter((tx) => tx.status?.toUpperCase() === 'COMPLETED');
  const salesAmount = completedTx
    .filter((tx) => tx.seller?.id === user?.id)
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <>
      <h1 className="dash-welcome">Chào mừng trở lại, {user?.username || 'bạn'}.</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải…</div>
      ) : (
        <>
          <div className="dash-stats">
            <div className="dash-stat-card">
              <div className="dash-stat-value">{products.length}</div>
              <div className="dash-stat-label">Sản Phẩm Đã Đăng</div>
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
              <Link to="/products/new" className="dash-section-action">+ Đăng Mới</Link>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Bạn chưa đăng sản phẩm nào. <Link to="/products/new">Đăng ngay!</Link>
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
                          <span className="dash-table-product-name">{p.name}</span>
                        </div>
                      </td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <span className={`dash-status ${p.status?.toUpperCase() === 'APPROVED' ? 'dash-status-active' : 'dash-status-draft'}`}>
                          {p.status?.toUpperCase() === 'APPROVED' ? 'Đã duyệt'
                            : p.status?.toUpperCase() === 'PENDING' ? 'Chờ duyệt'
                            : p.status?.toUpperCase() === 'SOLD' ? 'Đã bán'
                            : p.status}
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
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await productsApi.getMyProducts({ page: 0, size: MY_PRODUCTS_PAGE_SIZE });
      setProducts(extractPage(res).content);
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

  const statusLabel = (s) => {
    const u = s?.toUpperCase();
    if (u === 'APPROVED') return 'Đã Duyệt';
    if (u === 'PENDING') return 'Chờ Duyệt';
    if (u === 'REJECTED') return 'Bị Từ Chối';
    if (u === 'SOLD') return 'Đã Bán';
    return s;
  };

  const statusClass = (s) => {
    const u = s?.toUpperCase();
    if (u === 'APPROVED') return 'dash-status-active';
    if (u === 'REJECTED') return 'dash-status-draft';
    if (u === 'SOLD') return 'dash-status-active';
    return 'dash-status-pending';
  };

  return (
    <>
      <h1 className="dash-welcome">Sản Phẩm Của Tôi</h1>

      {/* Lưu ý: sản phẩm mới đăng sẽ ở trạng thái "Chờ Duyệt" */}
      <div style={{
        background: 'var(--info-light)', border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
        marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: '#1e40af',
      }}>
        Sản phẩm mới đăng sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi admin kiểm duyệt xong.
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Tất Cả Sản Phẩm ({products.length})</h2>
          <button className="dash-section-action" onClick={() => navigate('/products/new')}>
            + Đăng Sản Phẩm Mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải…</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Bạn chưa đăng sản phẩm nào. <Link to="/products/new">Đăng ngay!</Link>
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
                      <Link to={`/products/${product.id}`} className="dash-table-product-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className={`dash-status ${statusClass(product.status)}`}>
                      {statusLabel(product.status)}
                    </span>
                  </td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <div className="dash-table-actions">
                      <button className="dash-table-btn" onClick={() => navigate(`/products/${product.id}`)}>Xem</button>
                      {product.status?.toUpperCase() !== 'SOLD' && (
                        <button className="dash-table-btn" onClick={() => navigate(`/products/${product.id}/edit`)}>Sửa</button>
                      )}
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

  const statusMap = {
    PENDING: 'Chờ xác nhận', ACCEPTED: 'Đã chấp nhận', MEETING: 'Đang gặp mặt',
    COMPLETED: 'Hoàn thành', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy', DISPUTED: 'Tranh chấp',
  };

  return (
    <>
      <h1 className="dash-welcome">Đơn Hàng Đã Mua</h1>

      <div className="dash-section">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải…</div>
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
                  <td>
                    <span className="dash-status dash-status-active">
                      {statusMap[tx.status?.toUpperCase()] || tx.status}
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

  const completedSales = transactions.filter((tx) => tx.status?.toUpperCase() === 'COMPLETED');
  const totalRevenue = completedSales.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const statusMap = {
    PENDING: 'Chờ xác nhận', ACCEPTED: 'Đã chấp nhận', MEETING: 'Đang gặp mặt',
    COMPLETED: 'Hoàn thành', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy', DISPUTED: 'Tranh chấp',
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
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải…</div>
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
                    <span className={`dash-status ${tx.status?.toUpperCase() === 'COMPLETED' ? 'dash-status-active' : 'dash-status-pending'}`}>
                      {statusMap[tx.status?.toUpperCase()] || tx.status}
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

function SettingsView() {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="dash-welcome">Cài Đặt Tài Khoản</h1>
      <div className="dash-section" style={{ padding: 'var(--space-6)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', maxWidth: '36rem', lineHeight: 1.6 }}>
          Hồ sơ, đổi mật khẩu, xác thực email/SĐT và cài đặt thông báo đều nằm tại trang{' '}
          <strong>Hồ sơ</strong> — tránh trùng form và luôn gọi API thật.
        </p>
        <button type="button" className="dash-section-action" onClick={() => navigate('/profile')}>
          Mở trang Hồ sơ
        </button>
      </div>
    </>
  );
}
