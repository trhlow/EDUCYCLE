import { useState } from 'react';
import './AdminPage.css';

const ADMIN_MENU = [
  { icon: '📊', label: 'Bảng Điều Khiển', view: 'overview' },
  { icon: '👥', label: 'Người Dùng', view: 'users' },
  { icon: '📚', label: 'Sản Phẩm', view: 'products' },
  { icon: '💳', label: 'Giao Dịch', view: 'orders' },
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
        {currentView === 'orders' && <AdminOrders />}
        {currentView === 'moderation' && <AdminModeration />}
      </div>
    </div>
  );
}

function AdminOverview() {
  return (
    <>
      <h1 className="admin-page-title">Bảng Điều Khiển Quản Trị</h1>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Tổng Người Dùng</div>
          <div className="admin-stat-value">2,450</div>
          <div className="admin-stat-change positive">+12% tháng này</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Sản Phẩm</div>
          <div className="admin-stat-value">890</div>
          <div className="admin-stat-change positive">+5% tháng này</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Doanh Thu</div>
          <div className="admin-stat-value">$45.2K</div>
          <div className="admin-stat-change positive">+18% tháng này</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Đánh Giá TB</div>
          <div className="admin-stat-value">4.7</div>
          <div className="admin-stat-change positive">+0.2 tháng này</div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Hoạt Động Gần Đây</h2>
        </div>
        <div className="admin-activity">
          {[
            { dot: 'green', text: 'Người dùng mới đăng ký: alice@example.com', time: '2 phút trước' },
            { dot: 'blue', text: 'Sản phẩm mới gửi: Advanced React Patterns', time: '15 phút trước' },
            { dot: 'yellow', text: 'Đánh giá bị ghi cờ: Khóa học #234', time: '1 giờ trước' },
            { dot: 'green', text: 'Thanh toán đã xử lý: Đơn #1234 - $89.99', time: '2 giờ trước' },
            { dot: 'red', text: 'Thanh toán thất bại: Đơn #1235 - $49.99', time: '3 giờ trước' },
            { dot: 'blue', text: 'Sản phẩm đã duyệt: Cơ Bản Khoa Học Dữ Liệu', time: '4 giờ trước' },
          ].map((item, i) => (
            <div key={i} className="admin-activity-item">
              <span className={`admin-activity-dot ${item.dot}`} />
              <span>{item.text}</span>
              <span className="admin-activity-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AdminUsers() {
  return (
    <>
      <h1 className="admin-page-title">Quản Lý Người Dùng</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Tìm người dùng..." />
          </div>
          <button className="admin-btn admin-btn-primary">+ Thêm Người Dùng</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#001', name: 'John Doe', email: 'john@example.com', role: 'Người dùng', status: 'active' },
              { id: '#002', name: 'Jane Smith', email: 'jane@example.com', role: 'Người bán', status: 'active' },
              { id: '#003', name: 'Bob Johnson', email: 'bob@example.com', role: 'Quản trị', status: 'active' },
              { id: '#004', name: 'Alice Lee', email: 'alice@example.com', role: 'Người dùng', status: 'banned' },
              { id: '#005', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Người bán', status: 'active' },
            ].map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`admin-status ${user.status === 'active' ? 'admin-status-active' : 'admin-status-banned'}`}>
                    {user.status === 'active' ? 'Đang Hoạt Động' : 'Bị Cấm'}
                  </span>
                </td>
                <td>
                  <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminProducts() {
  return (
    <>
      <h1 className="admin-page-title">Quản Lý Sản Phẩm</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Tìm sản phẩm..." />
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sản Phẩm</th>
              <th>Người Bán</th>
              <th>Danh Mục</th>
              <th>Giá</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Python Nâng Cao', seller: 'CodeMaster Pro', category: 'Lập Trình', price: '$49.99', status: 'active' },
              { name: 'Bootcamp Phát Triển Web', seller: 'WebDev Academy', category: 'Phát Triển Web', price: '$89.99', status: 'active' },
              { name: 'Khoa Học Dữ Liệu 101', seller: 'DataPro Institute', category: 'Khoa Học Dữ Liệu', price: '$69.99', status: 'pending' },
              { name: 'Khóa Thiết Kế UI', seller: 'Design Guru', category: 'Thiết Kế', price: '$59.99', status: 'active' },
            ].map((product, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</td>
                <td>{product.seller}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>
                  <span className={`admin-status ${product.status === 'active' ? 'admin-status-active' : 'admin-status-pending'}`}>
                    {product.status === 'active' ? 'Đang Hoạt Động' : 'Đang Chờ'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}>
                      Xem
                    </button>
                    <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem', color: 'var(--error)' }}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminOrders() {
  return (
    <>
      <h1 className="admin-page-title">Giao Dịch</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Tìm giao dịch..." />
            <button className="admin-btn admin-btn-outline">Lọc</button>
            <button className="admin-btn admin-btn-outline">Xuất</button>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày</th>
              <th>Người Mua</th>
              <th>Sản Phẩm</th>
              <th>Số Tiền</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#1230', date: '14 Tháng 2', buyer: 'John D.', product: 'Khóa Python', amount: '$49.99', status: 'complete' },
              { id: '#1231', date: '14 Tháng 2', buyer: 'Jane S.', product: 'Bootcamp React', amount: '$89.99', status: 'pending' },
              { id: '#1232', date: '13 Tháng 2', buyer: 'Bob J.', product: 'Khóa Thiết Kế', amount: '$59.99', status: 'failed' },
              { id: '#1233', date: '13 Tháng 2', buyer: 'Alice L.', product: 'Tiếp Thị 101', amount: '$39.99', status: 'complete' },
              { id: '#1234', date: '12 Tháng 2', buyer: 'Charlie B.', product: 'Khoa Học Dữ Liệu', amount: '$69.99', status: 'complete' },
            ].map((tx) => (
              <tr key={tx.id}>
                <td style={{ fontWeight: 500 }}>{tx.id}</td>
                <td>{tx.date}</td>
                <td>{tx.buyer}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.product}</td>
                <td>{tx.amount}</td>
                <td>
                  <span className={`admin-status admin-status-${tx.status}`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </td>
                <td>
                  <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}>
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminModeration() {
  return (
    <>
      <h1 className="admin-page-title">Kiểm Duyệt Nội Dung</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Đang Chờ Duyệt (3)</h2>
        </div>
        {[
          { title: 'Advanced React Patterns', seller: 'John Doe', category: 'Phát Triển Web', price: '$79.99', time: '2 giờ trước' },
          { title: 'Machine Learning A-Z', seller: 'DataPro Institute', category: 'Khoa Học Dữ Liệu', price: '$99.99', time: '5 giờ trước' },
          { title: 'DevOps Fundamentals', seller: 'CloudOps Expert', category: 'DevOps', price: '$69.99', time: '1 ngày trước' },
        ].map((item, i) => (
          <div key={i} className="admin-mod-card">
            <div className="admin-mod-title">{item.title}</div>
            <div className="admin-mod-meta">
              <span>Người bán: {item.seller}</span>
              <span>Danh mục: {item.category} &middot; Giá: {item.price}</span>
              <span>Đã gửi: {item.time}</span>
            </div>
            <div className="admin-mod-actions">
              <button className="admin-btn admin-btn-outline">Xem Trước</button>
              <button className="admin-btn admin-btn-success">Duyệt</button>
              <button className="admin-btn admin-btn-danger">Từ Chối</button>
              <button className="admin-btn admin-btn-warning">Yêu Cầu Sửa Đổi</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
