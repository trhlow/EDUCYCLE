import { formatPrice, formatDate } from '../utils/format';
import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { adminApi, productsApi, transactionsApi, categoriesApi, reviewsApi, messagesApi } from '../api/endpoints';
import './AdminPage.css';

const ADMIN_MENU = [
  { icon: '📊', label: 'Bảng Điều Khiển', view: 'overview' },
  { icon: '👥', label: 'Người Dùng', view: 'users' },
  { icon: '📚', label: 'Sản Phẩm', view: 'products' },
  { icon: '🏷️', label: 'Danh Mục', view: 'categories' },
  { icon: '💳', label: 'Giao Dịch', view: 'orders' },
  { icon: '⭐', label: 'Đánh Giá', view: 'reviews' },
  { icon: '💬', label: 'Tin Nhắn', view: 'messages' },
  { icon: '🔍', label: 'Kiểm Duyệt', view: 'moderation' },
];

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">🎓 Quản Trị EduCycle</div>

        <div className="admin-sidebar-section">
          <div className="admin-sidebar-section-title">Quản Lý</div>
          {ADMIN_MENU.map((item) => (
            <button
              key={item.view}
              className={`admin-sidebar-link ${currentView === item.view ? 'active' : ''}`}
              onClick={() => handleViewChange(item.view)}
            >
              <span className="admin-sidebar-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {sidebarOpen && (
          <button className="admin-sidebar-link" onClick={() => setSidebarOpen(false)}>
            <span className="admin-sidebar-link-icon">✕</span>
            Đóng Menu
          </button>
        )}
      </aside>

      <div className="admin-main">
        <button className="admin-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰ Menu Quản Trị
        </button>

        {currentView === 'overview' && <AdminOverview />}
        {currentView === 'users' && <AdminUsers />}
        {currentView === 'products' && <AdminProducts />}
        {currentView === 'categories' && <AdminCategories />}
        {currentView === 'orders' && <AdminOrders />}
        {currentView === 'reviews' && <AdminReviews />}
        {currentView === 'messages' && <AdminMessages />}
        {currentView === 'moderation' && <AdminModeration />}
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (n) => n != null ? n.toLocaleString('vi-VN') : '—';

  return (
    <>
      <h1 className="admin-page-title">Bảng Điều Khiển Quản Trị</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>⏳ Đang tải thống kê...</div>
      ) : !stats ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Không thể tải thống kê</div>
      ) : (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Tổng Người Dùng</div>
            <div className="admin-stat-value">{formatNumber(stats.totalUsers)}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Tổng Sản Phẩm</div>
            <div className="admin-stat-value">{formatNumber(stats.totalProducts)}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Chờ Duyệt</div>
            <div className="admin-stat-value">{formatNumber(stats.pendingProducts)}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Tổng Giao Dịch</div>
            <div className="admin-stat-value">{formatNumber(stats.totalTransactions)}</div>
          </div>
        </div>
      )}
    </>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getUsers();
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Người Dùng</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input
              className="admin-search"
              type="text"
              placeholder="Tìm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không có người dùng nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai Trò</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id || user.userId}>
                  <td style={{ fontWeight: 500, fontSize: 'var(--text-xs)' }}>
                    {String(user.id || user.userId).substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-status ${user.role === 'Admin' ? 'admin-status-active' : 'admin-status-pending'}`}>
                      {user.role === 'Admin' ? 'Quản trị' : 'Người dùng'}
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

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsApi.getAllForAdmin();
        const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  

  const statusLabel = (s) => {
    if (s === 'Approved') return 'Đã duyệt';
    if (s === 'Pending') return 'Chờ duyệt';
    if (s === 'Rejected') return 'Từ chối';
    return s;
  };

  const statusClass = (s) => {
    if (s === 'Approved') return 'admin-status-active';
    if (s === 'Pending') return 'admin-status-pending';
    if (s === 'Rejected') return 'admin-status-banned';
    return '';
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.name || '').toLowerCase().includes(q) || (p.sellerName || '').toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Sản Phẩm</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input
              className="admin-search"
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không có sản phẩm nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản Phẩm</th>
                <th>Người Bán</th>
                <th>Danh Mục</th>
                <th>Giá</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</td>
                  <td>{product.sellerName || '—'}</td>
                  <td>{product.categoryName || product.category || '—'}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <span className={`admin-status ${statusClass(product.status)}`}>
                      {statusLabel(product.status)}
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

function AdminOrders() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await transactionsApi.getAll();
        const data = Array.isArray(res.data) ? res.data : [];
        setTransactions(data);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  
  

  const statusMap = {
    Pending: 'Chờ xác nhận', Accepted: 'Đã chấp nhận', Meeting: 'Đang gặp mặt',
    Completed: 'Hoàn thành', AutoCompleted: 'Tự hoàn thành',
    Rejected: 'Từ chối', Cancelled: 'Đã hủy', Disputed: 'Tranh chấp',
  };

  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase();
    return !q
      || (tx.buyer?.username || '').toLowerCase().includes(q)
      || (tx.seller?.username || '').toLowerCase().includes(q)
      || (tx.product?.name || '').toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="admin-page-title">Giao Dịch</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input
              className="admin-search"
              type="text"
              placeholder="Tìm giao dịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không có giao dịch nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Người Mua</th>
                <th>Người Bán</th>
                <th>Sản Phẩm</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>{tx.buyer?.username || '—'}</td>
                  <td>{tx.seller?.username || '—'}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.product?.name || '—'}</td>
                  <td>{formatPrice(tx.amount)}</td>
                  <td>
                    <span className="admin-status admin-status-active">
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

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const toast = useToast();

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoriesApi.update(editingId, form);
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoriesApi.create(form);
        toast.success('Đã tạo danh mục mới');
      }
      setForm({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch {
      toast.error('Không thể lưu danh mục');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '' });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này? Sản phẩm trong danh mục có thể bị ảnh hưởng.')) return;
    try {
      await categoriesApi.delete(id);
      toast.success('Đã xóa danh mục');
      fetchCategories();
    } catch {
      toast.error('Không thể xóa danh mục');
    }
  };

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Danh Mục</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Danh Mục Sản Phẩm ({categories.length})</h2>
          <button className="admin-btn admin-btn-success" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '' }); }}>
            {showForm ? '✕ Đóng' : '+ Tạo Mới'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Tên Danh Mục *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: '100%', padding: 'var(--space-3)', border: '2px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Mô Tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: 'var(--space-3)', border: '2px solid var(--border-light)', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-success">
              {editingId ? 'Cập Nhật' : 'Tạo Mới'}
            </button>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có danh mục nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mô Tả</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</td>
                  <td>{cat.description || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="admin-btn" onClick={() => handleEdit(cat)}>Sửa</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(cat.id)}>Xóa</button>
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

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchReviews = async () => {
    try {
      const res = await reviewsApi.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      await reviewsApi.delete(id);
      toast.success('Đã xóa đánh giá');
      fetchReviews();
    } catch {
      toast.error('Không thể xóa đánh giá');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Đánh Giá</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Tất Cả Đánh Giá ({reviews.length})</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có đánh giá nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Sản Phẩm</th>
                <th>Người Dùng</th>
                <th>Đánh Giá</th>
                <th>Nội Dung</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{formatDate(review.createdAt)}</td>
                  <td style={{ fontWeight: 500 }}>{review.product?.name || review.productName || '—'}</td>
                  <td>{review.reviewer?.username || review.reviewerName || '—'}</td>
                  <td>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                      {'⭐'.repeat(review.rating || 0)} ({review.rating}/5)
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {review.content || '—'}
                  </td>
                  <td>
                    <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(review.id)}>Xóa</button>
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

function AdminMessages() {
  return (
    <>
      <h1 className="admin-page-title">Quản Lý Tin Nhắn</h1>

      <div className="admin-section">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💬</div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Tin nhắn gắn với giao dịch</h3>
          <p>Tin nhắn chỉ có thể xem trong chi tiết từng giao dịch. Truy cập tab "Giao Dịch" để xem chi tiết.</p>
        </div>
      </div>
    </>
  );
}

function AdminModeration() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await productsApi.getPending();
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setPending(data);
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await productsApi.approve(id);
      toast.success('Sản phẩm đã được duyệt!');
      fetchPending();
    } catch {
      toast.error('Không thể duyệt sản phẩm.');
    }
  };

  const handleReject = async (id) => {
    try {
      await productsApi.reject(id);
      toast.success('Sản phẩm đã bị từ chối.');
      fetchPending();
    } catch {
      toast.error('Không thể từ chối sản phẩm.');
    }
  };

  

  return (
    <>
      <h1 className="admin-page-title">Kiểm Duyệt Nội Dung</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Đang Chờ Duyệt ({pending.length})</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Không có sản phẩm nào chờ duyệt 🎉
          </div>
        ) : (
          pending.map((item) => (
            <div key={item.id} className="admin-mod-card">
              <div className="admin-mod-title">{item.name}</div>
              <div className="admin-mod-meta">
                <span>Người bán: {item.sellerName || '—'}</span>
                <span>Danh mục: {item.categoryName || item.category || '—'} &middot; Giá: {formatPrice(item.price)}</span>
                <span>Tình trạng: {item.condition || '—'}</span>
              </div>
              {item.description && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                  {item.description.length > 200 ? item.description.substring(0, 200) + '...' : item.description}
                </p>
              )}
              <div className="admin-mod-actions">
                <button className="admin-btn admin-btn-success" onClick={() => handleApprove(item.id)}>
                  ✅ Duyệt
                </button>
                <button className="admin-btn admin-btn-danger" onClick={() => handleReject(item.id)}>
                  ❌ Từ Chối
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
