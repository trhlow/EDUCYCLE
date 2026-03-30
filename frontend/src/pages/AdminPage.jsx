import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '../utils/format';
import { useState, useEffect } from 'react';
import EduCycleLogo from '../components/branding/EduCycleLogo';
import { useToast } from '../components/Toast';
import { adminApi, productsApi, transactionsApi, categoriesApi, reviewsApi } from '../api/endpoints';
import { maskEmail } from '../utils/maskUsername'; // Issue #7
import './AdminPage.css';

/** Sprint 3: từ chối tin kèm lý do (notify seller từ BE) */
function RejectReasonModal({
  open, productName, reason, onReasonChange, onCancel, onConfirm, submitting,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)',
      }}
      onClick={onCancel}
      role="presentation"
    >
      <div
        style={{
          background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', maxWidth: 440, width: '100%',
          padding: 'var(--space-6)', boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        <h3 id="reject-modal-title" style={{ marginTop: 0, marginBottom: 'var(--space-3)' }}>Từ chối tin</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
          {productName}
        </p>
        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Lý do (tuỳ chọn, tối đa 2000 ký tự)
        </label>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="VD: Ảnh mờ, mô tả không khớp nội dung, vi phạm nội quy..."
          style={{
            width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)', fontSize: 'var(--text-sm)', resize: 'vertical', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button type="button" className="admin-btn" onClick={onCancel} disabled={submitting}>Hủy</button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Đang gửi…' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  );
}

function productThumbUrls(item) {
  if (item.imageUrls && item.imageUrls.length) return item.imageUrls.slice(0, 5);
  if (item.imageUrl) return [item.imageUrl];
  return [];
}

const ADMIN_MENU = [
  { label: 'Bảng điều khiển', view: 'overview' },
  { label: 'Kiểm duyệt', view: 'moderation' },
  { label: 'Người dùng', view: 'users' },
  { label: 'Sản phẩm', view: 'products' },
  { label: 'Danh mục', view: 'categories' },
  { label: 'Giao dịch', view: 'orders' },
  { label: 'Đánh giá', view: 'reviews' },
];

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view) => { setCurrentView(view); setSidebarOpen(false); };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <Link to="/" className="admin-sidebar-brand-home" aria-label="EduCycle — về trang chủ">
            <EduCycleLogo size={34} variant="inverse" />
          </Link>
          <div className="admin-sidebar-brand-title">Quản trị EduCycle</div>
        </div>
        <div className="admin-sidebar-section">
          <div className="admin-sidebar-section-title">Quản Lý</div>
          {ADMIN_MENU.map(item => (
            <button key={item.view} className={`admin-sidebar-link ${currentView === item.view ? 'active' : ''}`} onClick={() => handleViewChange(item.view)}>
              {item.label}
            </button>
          ))}
        </div>
        {sidebarOpen && (
          <button className="admin-sidebar-link" onClick={() => setSidebarOpen(false)}>
            Đóng menu
          </button>
        )}
      </aside>

      <div className="admin-main">
        <button className="admin-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>Menu quản trị</button>
        {currentView === 'overview'   && <AdminOverview onNavigate={handleViewChange} />}
        {currentView === 'moderation' && <AdminModeration />}
        {currentView === 'users'      && <AdminUsers />}
        {currentView === 'products'   && <AdminProducts />}
        {currentView === 'categories' && <AdminCategories />}
        {currentView === 'orders'     && <AdminOrders />}
        {currentView === 'reviews'    && <AdminReviews />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Operational Dashboard
   ═══════════════════════════════════════ */
function AdminOverview({ onNavigate }) {
  const toast = useToast();
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [allTx,   setAllTx]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectBusy, setRejectBusy] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, txRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ data: null })),
        productsApi.getPending().catch(() => ({ data: [] })),
        transactionsApi.getAll().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setPending(Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data?.items || []);
      setAllTx(Array.isArray(txRes.data) ? txRes.data : []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id) => {
    try { await productsApi.approve(id); toast.success('Đã duyệt'); fetchAll(); }
    catch { toast.error('Không thể duyệt'); }
  };
  const openReject = (id, name) => { setRejectReason(''); setRejectModal({ id, name: name || 'Sản phẩm' }); };
  const closeReject = () => { if (!rejectBusy) setRejectModal(null); };
  const confirmReject = async () => {
    if (!rejectModal) return;
    setRejectBusy(true);
    try {
      const body = rejectReason.trim() ? { reason: rejectReason.trim() } : {};
      await productsApi.reject(rejectModal.id, body);
      toast.success('Đã từ chối — người bán nhận thông báo.');
      setRejectModal(null);
      fetchAll();
    } catch {
      toast.error('Không thể từ chối');
    } finally {
      setRejectBusy(false);
    }
  };

  const fmt = n => n != null ? Number(n).toLocaleString('vi-VN') : '—';
  const disputedTx = allTx.filter(tx => tx.status?.toUpperCase() === 'DISPUTED');
  const activeTx   = allTx.filter(tx => ['PENDING','ACCEPTED','MEETING'].includes(tx.status?.toUpperCase()));
  const recentTx   = [...allTx].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,8);

  const txBadge = (s) => {
    const cfg = {
      PENDING:   { bg:'var(--warning-light)',  color:'#e65100', label:'Chờ xác nhận' },
      ACCEPTED:  { bg:'var(--info-light)',     color:'#1565c0', label:'Đã chấp nhận' },
      MEETING:   { bg:'#e8eaf6',              color:'#3949ab', label:'Đang gặp mặt' },
      COMPLETED: { bg:'var(--success-light)', color:'#2e7d32', label:'Hoàn thành'   },
      REJECTED:  { bg:'var(--error-light)',   color:'#c62828', label:'Từ chối'       },
      CANCELLED: { bg:'var(--bg-tertiary)',   color:'#616161', label:'Đã hủy'        },
      DISPUTED:  { bg:'#fbe9e7',             color:'#bf360c', label:'Tranh chấp'    },
    };
    const c = cfg[s?.toUpperCase()] || cfg.CANCELLED;
    return <span style={{ background:c.bg, color:c.color, padding:'2px 10px', borderRadius:'var(--radius-full)', fontSize:'var(--text-xs)', fontWeight:500, whiteSpace:'nowrap' }}>{c.label}</span>;
  };

  if (loading) return <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)' }}>Đang tải dữ liệu…</div>;

  const hasAlerts = pending.length > 0 || disputedTx.length > 0;

  return (
    <>
      <RejectReasonModal
        open={!!rejectModal}
        productName={rejectModal?.name}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={closeReject}
        onConfirm={confirmReject}
        submitting={rejectBusy}
      />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'var(--space-6)', gap:'var(--space-4)', flexWrap:'wrap' }}>
        <div>
          <h1 className="admin-page-title" style={{ marginBottom:'var(--space-1)' }}>Bảng điều khiển vận hành</h1>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>
            Cập nhật lúc {lastRefresh.toLocaleTimeString('vi-VN')}
            {hasAlerts && <span style={{ marginLeft:'var(--space-3)', color:'var(--error)', fontWeight:500 }}>Có vấn đề cần xử lý</span>}
          </p>
        </div>
        <button onClick={fetchAll} style={{ padding:'var(--space-2) var(--space-4)', background:'var(--primary-50)', color:'var(--primary-700)', border:'1px solid var(--primary-200)', borderRadius:'var(--radius-md)', fontSize:'var(--text-sm)', cursor:'pointer', whiteSpace:'nowrap' }}>
          Làm mới
        </button>
      </div>

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'var(--space-4)', marginBottom:'var(--space-6)' }}>
        {[
          { label:'Người dùng',  value:fmt(stats?.totalUsers),                              bg:'var(--primary-50)',   color:'var(--primary-700)', alert:false },
          { label:'Sản phẩm',    value:fmt(stats?.totalProducts),                           bg:'var(--secondary-50)', color:'#2e7d32',            alert:false },
          { label:'Chờ duyệt',   value:fmt(stats?.pendingProducts ?? pending.length),       bg:'var(--warning-light)',color:'#e65100',            alert:(stats?.pendingProducts ?? pending.length) > 0 },
          { label:'Giao dịch',   value:fmt(stats?.totalTransactions),                       bg:'var(--info-light)',   color:'#1565c0',            alert:false },
          { label:'Tranh chấp',  value:String(disputedTx.length),                           bg:'var(--error-light)',  color:'#c62828',            alert:disputedTx.length > 0 },
          { label:'Đang xử lý',  value:String(activeTx.length),                             bg:'#e8eaf6',            color:'#3949ab',            alert:false },
        ].map((k,i) => (
          <div key={i} style={{ background:'var(--bg-primary)', border:k.alert?'1.5px solid var(--error)':'1px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:'var(--space-4)', boxShadow:k.alert?'0 0 0 3px rgba(244,67,54,.08)':'none' }}>
            <div style={{ fontSize:'var(--text-2xl)', fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</div>
            <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginTop:'var(--space-1)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Row 2: Cần xử lý */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-5)', marginBottom:'var(--space-6)' }}>
        {/* Chờ duyệt */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title" style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
              Chờ duyệt
              {pending.length > 0 && <span style={{ background:'var(--error)', color:'#fff', borderRadius:'var(--radius-full)', padding:'1px 8px', fontSize:'var(--text-xs)', fontWeight:700 }}>{pending.length}</span>}
            </h2>
            {pending.length > 3 && <button onClick={() => onNavigate('moderation')} style={{ fontSize:'var(--text-xs)', color:'var(--primary-600)', background:'none', border:'none', cursor:'pointer' }}>Xem tất cả</button>}
          </div>
          {pending.length === 0 ? (
            <div style={{ textAlign:'center', padding:'var(--space-8)', color:'var(--text-secondary)' }}>
              Không có sản phẩm chờ duyệt
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)', maxHeight:340, overflowY:'auto' }}>
              {pending.slice(0,5).map(item => (
                <div key={item.id} style={{ padding:'var(--space-3)', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-light)' }}>
                  <div style={{ fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text-primary)', marginBottom:4 }}>{item.name}</div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginBottom:'var(--space-2)' }}>
                    {item.sellerName || '—'} · {item.category || '—'} · {formatPrice(item.price)}
                  </div>
                  {productThumbUrls(item).length > 0 && (
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'var(--space-2)' }}>
                      {productThumbUrls(item).map((u, i) => (
                        <img key={i} src={u} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:6, border:'1px solid var(--border-light)' }} />
                      ))}
                    </div>
                  )}
                  {item.description && (
                    <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', marginBottom:'var(--space-2)', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{item.description}</div>
                  )}
                  <div style={{ display:'flex', gap:'var(--space-2)' }}>
                    <button className="admin-btn admin-btn-success" onClick={() => handleApprove(item.id)} style={{ flex:1, fontSize:'var(--text-xs)' }}>Duyệt</button>
                    <button className="admin-btn admin-btn-danger"  onClick={() => openReject(item.id, item.name)}  style={{ flex:1, fontSize:'var(--text-xs)' }}>Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tranh chấp */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title" style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
              Tranh chấp
              {disputedTx.length > 0 && <span style={{ background:'var(--error)', color:'#fff', borderRadius:'var(--radius-full)', padding:'1px 8px', fontSize:'var(--text-xs)', fontWeight:700 }}>{disputedTx.length}</span>}
            </h2>
            {disputedTx.length > 0 && <button onClick={() => onNavigate('orders')} style={{ fontSize:'var(--text-xs)', color:'var(--primary-600)', background:'none', border:'none', cursor:'pointer' }}>Xem tất cả</button>}
          </div>
          {disputedTx.length === 0 ? (
            <div style={{ textAlign:'center', padding:'var(--space-8)', color:'var(--text-secondary)' }}>
              Không có tranh chấp nào
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
              {disputedTx.map(tx => (
                <div key={tx.id} style={{ padding:'var(--space-3)', background:'#fbe9e7', borderRadius:'var(--radius-md)', border:'1px solid #ffccbc' }}>
                  <div style={{ fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text-primary)', marginBottom:4 }}>{tx.product?.name || '—'}</div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginBottom:4 }}>
                    Mua: {tx.buyer?.username || '—'} — Bán: {tx.seller?.username || '—'}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'var(--text-xs)', color:'#bf360c', fontWeight:600 }}>{formatPrice(tx.amount)}</span>
                    <span style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)' }}>{formatDate(tx.createdAt)}</span>
                  </div>
                  <div style={{ marginTop:'var(--space-2)', fontSize:'var(--text-xs)', color:'#bf360c' }}>Cần xem xét chat và bằng chứng</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Giao dịch đang xử lý */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Giao dịch đang hoạt động <span style={{ fontSize:'var(--text-sm)', fontWeight:400, color:'var(--text-secondary)' }}>({activeTx.length})</span></h2>
          <button onClick={() => onNavigate('orders')} style={{ fontSize:'var(--text-xs)', color:'var(--primary-600)', background:'none', border:'none', cursor:'pointer' }}>Xem tất cả</button>
        </div>
        {activeTx.length === 0 ? (
          <div style={{ textAlign:'center', padding:'var(--space-6)', color:'var(--text-secondary)' }}>Không có giao dịch đang xử lý</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Thời gian</th><th>Người mua</th><th>Người bán</th><th>Sản phẩm</th><th>Giá trị</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {activeTx.slice(0,8).map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{formatDate(tx.createdAt)}</td>
                  <td style={{ fontWeight:500 }}>{tx.buyer?.username || '—'}</td>
                  <td style={{ fontWeight:500 }}>{tx.seller?.username || '—'}</td>
                  <td style={{ color:'var(--text-primary)' }}>{tx.product?.name || '—'}</td>
                  <td style={{ fontWeight:600, whiteSpace:'nowrap' }}>{formatPrice(tx.amount)}</td>
                  <td>{txBadge(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Feed gần nhất */}
      <div className="admin-section" style={{ marginTop:'var(--space-5)' }}>
        <div className="admin-section-header"><h2 className="admin-section-title">Hoạt động gần nhất</h2></div>
        {recentTx.length === 0 ? (
          <div style={{ textAlign:'center', padding:'var(--space-4)', color:'var(--text-secondary)' }}>Chưa có giao dịch</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
            {recentTx.map(tx => (
              <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', padding:'var(--space-3)', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', fontSize:'var(--text-sm)' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontWeight:500, color:'var(--text-primary)' }}>{tx.product?.name || '—'}</span>
                  <span style={{ color:'var(--text-secondary)', marginLeft:'var(--space-2)' }}>· Mua: {tx.buyer?.username || '—'} · Bán: {tx.seller?.username || '—'}</span>
                </div>
                <span style={{ fontWeight:600, color:'var(--primary-700)', whiteSpace:'nowrap' }}>{formatPrice(tx.amount)}</span>
                {txBadge(tx.status)}
                <span style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', whiteSpace:'nowrap' }}>{formatDate(tx.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══ AdminUsers — Issue #7: mask email ═══ */
function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    adminApi.getUsers()
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    // search on username only — not email (privacy)
    return !q || (u.username || '').toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Người Dùng</h1>
      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Tìm theo tên người dùng..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {/* Issue #7: note about email masking */}
        <p style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', padding:'0 0 var(--space-3) 0' }}>
          Email được mã hoá để bảo vệ quyền riêng tư. Tìm kiếm chỉ theo tên người dùng.
        </p>
        {loading ? (
          <div style={{ textAlign:'center', padding:'2rem' }}>Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Không có người dùng nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên người dùng</th>
                {/* Issue #7: show masked email, not full email */}
                <th>Email (ẩn)</th>
                <th>Vai Trò</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id || u.userId}>
                  <td style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)' }}>
                    {String(u.id || u.userId).substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{u.username}</td>
                  {/* Issue #7: masked email */}
                  <td style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:'var(--text-xs)' }}>
                    {maskEmail(u.email)}
                  </td>
                  <td>
                    <span className={`admin-status ${u.role?.toUpperCase() === 'ADMIN' ? 'admin-status-active' : 'admin-status-pending'}`}>
                      {u.role?.toUpperCase() === 'ADMIN' ? 'Quản trị' : 'Người dùng'}
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
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    productsApi.getAllForAdmin()
      .then(res => setProducts(Array.isArray(res.data) ? res.data : res.data?.items || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = s => { const u=s?.toUpperCase(); if(u==='APPROVED')return'Đã duyệt'; if(u==='PENDING')return'Chờ duyệt'; if(u==='REJECTED')return'Từ chối'; if(u==='SOLD')return'Đã bán'; return s; };
  const statusClass = s => { const u=s?.toUpperCase(); if(u==='APPROVED'||u==='SOLD')return'admin-status-active'; if(u==='REJECTED')return'admin-status-banned'; return'admin-status-pending'; };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || (p.name||'').toLowerCase().includes(q) || (p.sellerName||'').toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Sản Phẩm</h1>
      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div style={{ textAlign:'center', padding:'2rem' }}>Đang tải…</div>
          : filtered.length === 0 ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Không có sản phẩm nào</div>
          : (
            <table className="admin-table">
              <thead><tr><th>Sản Phẩm</th><th>Người Bán</th><th>Danh Mục</th><th>Giá</th><th>Trạng Thái</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{p.name}</td>
                    <td>{p.sellerName || '—'}</td>
                    <td>{p.categoryName || p.category || '—'}</td>
                    <td>{p.price === 0 ? 'Liên hệ' : formatPrice(p.price)}</td>
                    <td><span className={`admin-status ${statusClass(p.status)}`}>{statusLabel(p.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </>
  );
}

function AdminOrders() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [disputed, setDisputed] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [resolveBusy,  setResolveBusy]  = useState(null);
  const [resolveForms, setResolveForms] = useState({});

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      transactionsApi.getAll().then(res => Array.isArray(res.data) ? res.data : []).catch(() => []),
      adminApi.getDisputedTransactions().then(res => Array.isArray(res.data) ? res.data : []).catch(() => []),
    ])
      .then(([tx, disp]) => {
        setTransactions(tx);
        setDisputed(disp);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const setForm = (txId, patch) => {
    setResolveForms((prev) => ({
      ...prev,
      [txId]: { resolution: 'COMPLETED', adminNote: '', ...prev[txId], ...patch },
    }));
  };

  const handleResolve = async (txId) => {
    const f = resolveForms[txId] || { resolution: 'COMPLETED', adminNote: '' };
    setResolveBusy(txId);
    try {
      await adminApi.resolveDisputedTransaction(txId, {
        resolution: f.resolution || 'COMPLETED',
        adminNote: f.adminNote || undefined,
      });
      toast.success('Đã xử lý tranh chấp.');
      fetchAll();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không xử lý được.');
    } finally {
      setResolveBusy(null);
    }
  };

  const statusMap = { PENDING:'Chờ xác nhận', ACCEPTED:'Đã chấp nhận', MEETING:'Đang gặp mặt', COMPLETED:'Hoàn thành', AUTO_COMPLETED:'Tự hoàn thành', REJECTED:'Từ chối', CANCELLED:'Đã hủy', DISPUTED:'Tranh chấp' };

  const filtered = transactions.filter(tx => {
    const q = search.toLowerCase();
    return !q || (tx.buyer?.username||'').toLowerCase().includes(q) || (tx.seller?.username||'').toLowerCase().includes(q) || (tx.product?.name||'').toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="admin-page-title">Giao Dịch</h1>
      {disputed.length > 0 && (
        <div className="admin-section" style={{ marginBottom: 'var(--space-5)', border: '1px solid var(--error-light, #ffcdd2)' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Tranh chấp cần xử lý ({disputed.length})</h2>
            <button type="button" className="admin-btn" onClick={fetchAll}>Làm mới</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {disputed.map((tx) => {
              const fid = tx.id;
              const rf = resolveForms[fid] || { resolution: 'COMPLETED', adminNote: '' };
              return (
                <div key={fid} style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{tx.product?.name || '—'}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Mua: {tx.buyer?.username || '—'} · Bán: {tx.seller?.username || '—'} · #{fid}
                  </div>
                  {tx.disputeReason && (
                    <div style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}><strong>Lý do:</strong> {tx.disputeReason}</div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)' }}>
                      Kết quả
                      <select
                        className="admin-search"
                        style={{ minWidth: 180 }}
                        value={rf.resolution || 'COMPLETED'}
                        onChange={(e) => setForm(fid, { resolution: e.target.value })}
                      >
                        <option value="COMPLETED">Hoàn tất (đánh dấu đã bán)</option>
                        <option value="CANCELLED">Hủy giao dịch (không đánh dấu bán)</option>
                      </select>
                    </label>
                    <label style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)' }}>
                      Ghi chú admin (tuỳ chọn)
                      <input
                        className="admin-search"
                        type="text"
                        value={rf.adminNote || ''}
                        onChange={(e) => setForm(fid, { adminNote: e.target.value })}
                        placeholder="Thông báo tới hai bên..."
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-btn admin-btn-success"
                      disabled={resolveBusy === fid}
                      onClick={() => handleResolve(fid)}
                    >
                      {resolveBusy === fid ? 'Đang xử lý...' : 'Áp dụng'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="admin-search" type="text" placeholder="Tìm giao dịch..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="button" className="admin-btn" onClick={fetchAll}>Làm mới</button>
          </div>
        </div>
        {loading ? <div style={{ textAlign:'center', padding:'2rem' }}>Đang tải…</div>
          : filtered.length === 0 ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Không có giao dịch nào</div>
          : (
            <table className="admin-table">
              <thead><tr><th>Ngày</th><th>Người Mua</th><th>Người Bán</th><th>Sản Phẩm</th><th>Số Tiền</th><th>Trạng Thái</th></tr></thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td>{tx.buyer?.username || '—'}</td>
                    <td>{tx.seller?.username || '—'}</td>
                    <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{tx.product?.name || '—'}</td>
                    <td>{tx.amount === 0 ? 'Liên hệ' : formatPrice(tx.amount)}</td>
                    <td><span className="admin-status admin-status-active">{statusMap[tx.status?.toUpperCase()] || tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </>
  );
}

function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState({ name:'', description:'' });

  const fetch = () => {
    categoriesApi.getAll().then(res => setCategories(Array.isArray(res.data)?res.data:[])).catch(()=>setCategories([])).finally(()=>setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await categoriesApi.update(editingId, form); toast.success('Đã cập nhật'); }
      else           { await categoriesApi.create(form);            toast.success('Đã tạo mới'); }
      setForm({name:'',description:''}); setShowForm(false); setEditingId(null); fetch();
    } catch { toast.error('Không thể lưu danh mục'); }
  };
  const handleEdit   = c => { setForm({name:c.name, description:c.description||''}); setEditingId(c.id); setShowForm(true); };
  const handleDelete = async id => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try { await categoriesApi.delete(id); toast.success('Đã xóa'); fetch(); }
    catch { toast.error('Không thể xóa'); }
  };

  const inp = { width:'100%', padding:'var(--space-3)', border:'2px solid var(--border-light)', borderRadius:'var(--radius-md)' };

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Danh Mục</h1>
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Danh Mục ({categories.length})</h2>
          <button className="admin-btn admin-btn-success" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({name:'',description:''}); }}>
            {showForm ? 'Đóng' : 'Tạo mới'}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom:'var(--space-6)', padding:'var(--space-4)', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)' }}>
            <div style={{ marginBottom:'var(--space-3)' }}>
              <label style={{ display:'block', marginBottom:'var(--space-2)', fontWeight:600 }}>Tên Danh Mục *</label>
              <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={inp} />
            </div>
            <div style={{ marginBottom:'var(--space-4)' }}>
              <label style={{ display:'block', marginBottom:'var(--space-2)', fontWeight:600 }}>Mô Tả</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{...inp,resize:'vertical'}} />
            </div>
            <button type="submit" className="admin-btn admin-btn-success">{editingId?'Cập Nhật':'Tạo Mới'}</button>
          </form>
        )}
        {loading ? <div style={{ textAlign:'center', padding:'2rem' }}>Đang tải…</div>
          : categories.length === 0 ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Chưa có danh mục</div>
          : (
            <table className="admin-table">
              <thead><tr><th>Tên</th><th>Mô Tả</th><th>Hành Động</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{c.name}</td>
                    <td>{c.description||'—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:'var(--space-2)' }}>
                        <button className="admin-btn" onClick={()=>handleEdit(c)}>Sửa</button>
                        <button className="admin-btn admin-btn-danger" onClick={()=>handleDelete(c.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </>
  );
}

function AdminReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    reviewsApi.getAll().then(res=>setReviews(Array.isArray(res.data)?res.data:[])).catch(()=>setReviews([])).finally(()=>setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async id => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try { await reviewsApi.delete(id); toast.success('Đã xóa'); fetch(); }
    catch { toast.error('Không thể xóa'); }
  };

  return (
    <>
      <h1 className="admin-page-title">Quản Lý Đánh Giá</h1>
      <div className="admin-section">
        <div className="admin-section-header"><h2 className="admin-section-title">Tất Cả Đánh Giá ({reviews.length})</h2></div>
        {loading ? <div style={{ textAlign:'center', padding:'2rem' }}>Đang tải…</div>
          : reviews.length === 0 ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Chưa có đánh giá</div>
          : (
            <table className="admin-table">
              <thead><tr><th>Ngày</th><th>Người được đánh giá</th><th>Người đánh giá</th><th>Sao</th><th>Nội dung</th><th>Hành Động</th></tr></thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id}>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td style={{ fontWeight:500 }}>{r.targetUser?.username || r.targetUsername || r.product?.name || '—'}</td>
                    <td>{r.reviewer?.username || r.reviewerName || '—'}</td>
                    <td><span style={{ color:'#f59e0b', fontWeight:600 }}>{r.rating}/5</span></td>
                    <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.content||'—'}</td>
                    <td><button className="admin-btn admin-btn-danger" onClick={()=>handleDelete(r.id)}>Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </>
  );
}

function AdminModeration() {
  const toast = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectBusy, setRejectBusy] = useState(false);

  const fetch = () => {
    productsApi.getPending().then(res=>setPending(Array.isArray(res.data)?res.data:res.data?.items||[])).catch(()=>setPending([])).finally(()=>setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleApprove = async id => { try { await productsApi.approve(id); toast.success('Đã duyệt'); fetch(); } catch { toast.error('Không thể duyệt'); } };
  const openReject = (id, name) => { setRejectReason(''); setRejectModal({ id, name: name || 'Sản phẩm' }); };
  const closeReject = () => { if (!rejectBusy) setRejectModal(null); };
  const confirmReject = async () => {
    if (!rejectModal) return;
    setRejectBusy(true);
    try {
      const body = rejectReason.trim() ? { reason: rejectReason.trim() } : {};
      await productsApi.reject(rejectModal.id, body);
      toast.success('Đã từ chối — người bán nhận thông báo.');
      setRejectModal(null);
      fetch();
    } catch {
      toast.error('Không thể từ chối');
    } finally {
      setRejectBusy(false);
    }
  };

  return (
    <>
      <RejectReasonModal
        open={!!rejectModal}
        productName={rejectModal?.name}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={closeReject}
        onConfirm={confirmReject}
        submitting={rejectBusy}
      />
      <h1 className="admin-page-title">Kiểm Duyệt Nội Dung</h1>
      <div className="admin-section">
        <div className="admin-section-header"><h2 className="admin-section-title">Đang Chờ Duyệt ({pending.length})</h2></div>
        {loading ? <div style={{ textAlign:'center', padding:'2rem' }}>Đang tải…</div>
          : pending.length === 0 ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Không có sản phẩm chờ duyệt</div>
          : pending.map(item => (
            <div key={item.id} className="admin-mod-card">
              <div className="admin-mod-title">{item.name}</div>
              <div className="admin-mod-meta">
                <span>Người bán: {item.sellerName || '—'}</span>
                <span>Danh mục: {item.categoryName||item.category||'—'} · Giá: {item.price===0?'Liên hệ':formatPrice(item.price)}</span>
                <span>Tình trạng: {item.condition||'—'}</span>
              </div>
              {productThumbUrls(item).length > 0 && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'var(--space-2) 0' }}>
                  {productThumbUrls(item).map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer">
                      <img src={u} alt="" style={{ width:96, height:96, objectFit:'cover', borderRadius:8, border:'1px solid var(--border-light)', display:'block' }} />
                    </a>
                  ))}
                </div>
              )}
              {item.description && (
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', margin:'0.5rem 0' }}>
                  {item.description.length > 200 ? item.description.substring(0,200)+'...' : item.description}
                </p>
              )}
              <div className="admin-mod-actions">
                <button className="admin-btn admin-btn-success" onClick={() => handleApprove(item.id)}>Duyệt</button>
                <button className="admin-btn admin-btn-danger"  onClick={() => openReject(item.id, item.name)}>Từ chối</button>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}
