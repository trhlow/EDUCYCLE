import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-user">
          <div className="dash-sidebar-avatar">👤</div>
          <div>
            <div className="dash-sidebar-name">John Doe</div>
            <div className="dash-sidebar-email">john@example.com</div>
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

        <button className="dash-sidebar-link dash-sidebar-logout">
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

        {currentView === 'overview' && <OverviewView />}
        {currentView === 'products' && <ProductsView />}
        {currentView === 'purchases' && <PurchasesView />}
        {currentView === 'sales' && <SalesView />}
        {currentView === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

function OverviewView() {
  return (
    <>
      <h1 className="dash-welcome">Chào mừng trở lại, John! 👋</h1>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-value">12</div>
          <div className="dash-stat-label">Khóa Học</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">$2,450</div>
          <div className="dash-stat-label">Tổng Thu Nhập</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">4.8</div>
          <div className="dash-stat-label">Đánh Giá TB</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">856</div>
          <div className="dash-stat-label">Học Viên</div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Khóa Học Của Tôi</h2>
          <Link to="#" className="dash-section-action">+ Thêm Mới</Link>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Khóa Học</th>
              <th>Học Viên</th>
              <th>Doanh Thu</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="dash-table-product">
                  <span className="dash-table-product-icon">📘</span>
                  <span className="dash-table-product-name">Python Nâng Cao</span>
                </div>
              </td>
              <td>234</td>
              <td>$1,234</td>
              <td><span className="dash-status dash-status-active">Đang Hoạt Động</span></td>
            </tr>
            <tr>
              <td>
                <div className="dash-table-product">
                  <span className="dash-table-product-icon">📗</span>
                  <span className="dash-table-product-name">React Cơ Bản</span>
                </div>
              </td>
              <td>156</td>
              <td>$890</td>
              <td><span className="dash-status dash-status-active">Đang Hoạt Động</span></td>
            </tr>
            <tr>
              <td>
                <div className="dash-table-product">
                  <span className="dash-table-product-icon">📙</span>
                  <span className="dash-table-product-name">Khóa Thiết Kế UI</span>
                </div>
              </td>
              <td>89</td>
              <td>$445</td>
              <td><span className="dash-status dash-status-draft">Bản Nháp</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Giao Dịch Gần Đây</h2>
        </div>
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
            <tr>
              <td>Feb 14, 2024</td>
              <td><span className="dash-tx-type dash-tx-purchase">Mua</span></td>
              <td>Python Nâng Cao</td>
              <td>-$49.99</td>
            </tr>
            <tr>
              <td>Feb 13, 2024</td>
              <td><span className="dash-tx-type dash-tx-sale">Bán</span></td>
              <td>React Cơ Bản</td>
              <td>+$89.99</td>
            </tr>
            <tr>
              <td>Feb 12, 2024</td>
              <td><span className="dash-tx-type dash-tx-sale">Bán</span></td>
              <td>Python Nâng Cao</td>
              <td>+$49.99</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProductsView() {
  return (
    <>
      <h1 className="dash-welcome">Sản Phẩm Của Tôi</h1>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Tất Cả Sản Phẩm</h2>
          <button className="dash-section-action">+ Thêm Sản Phẩm Mới</button>
        </div>
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
            {[
              { icon: '📘', name: 'Python Nâng Cao', status: 'active', price: '$49.99' },
              { icon: '📗', name: 'React Cơ Bản', status: 'active', price: '$89.99' },
              { icon: '📙', name: 'Khóa Thiết Kế UI', status: 'draft', price: '$59.99' },
            ].map((product, i) => (
              <tr key={i}>
                <td>
                  <div className="dash-table-product">
                    <span className="dash-table-product-icon">{product.icon}</span>
                    <span className="dash-table-product-name">{product.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`dash-status ${product.status === 'active' ? 'dash-status-active' : 'dash-status-draft'}`}>
                    {product.status === 'active' ? 'Đang Hoạt Động' : 'Bản Nháp'}
                  </span>
                </td>
                <td>{product.price}</td>
                <td>
                  <div className="dash-table-actions">
                    <button className="dash-table-btn">Sửa</button>
                    <button className="dash-table-btn dash-table-btn-danger">Xóa</button>
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

function PurchasesView() {
  return (
    <>
      <h1 className="dash-welcome">Đơn Hàng Đã Mua</h1>

      <div className="dash-section">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Khóa Học</th>
              <th>Người Bán</th>
              <th>Số Tiền</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: '14 Tháng 2, 2024', course: 'Python Nâng Cao', seller: 'CodeMaster Pro', amount: '$49.99', status: 'Hoàn Thành' },
              { date: '10 Tháng 2, 2024', course: 'Phát Triển Web', seller: 'WebDev Academy', amount: '$89.99', status: 'Hoàn Thành' },
              { date: '5 Tháng 2, 2024', course: 'Khoa Học Dữ Liệu', seller: 'DataPro Institute', amount: '$69.99', status: 'Hoàn Thành' },
            ].map((tx, i) => (
              <tr key={i}>
                <td>{tx.date}</td>
                <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.course}</span></td>
                <td>{tx.seller}</td>
                <td>{tx.amount}</td>
                <td><span className="dash-status dash-status-active">{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SalesView() {
  return (
    <>
      <h1 className="dash-welcome">Lịch Sử Bán Hàng</h1>

      <div className="dash-stats" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-value">$2,450</div>
          <div className="dash-stat-label">Tổng Doanh Thu</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">48</div>
          <div className="dash-stat-label">Tổng Đơn Bán</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">$51.04</div>
          <div className="dash-stat-label">Giá Trị TB/Đơn</div>
        </div>
      </div>

      <div className="dash-section">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Người Mua</th>
              <th>Khóa Học</th>
              <th>Số Tiền</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: '14 Tháng 2, 2024', buyer: 'Alice K.', course: 'Python Nâng Cao', amount: '$49.99', status: 'Hoàn Thành' },
              { date: '13 Tháng 2, 2024', buyer: 'Bob M.', course: 'React Cơ Bản', amount: '$89.99', status: 'Hoàn Thành' },
              { date: '12 Tháng 2, 2024', buyer: 'Carol J.', course: 'Python Nâng Cao', amount: '$49.99', status: 'Đang Xử Lý' },
            ].map((tx, i) => (
              <tr key={i}>
                <td>{tx.date}</td>
                <td>{tx.buyer}</td>
                <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.course}</span></td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>+{tx.amount}</td>
                <td>
                  <span className={`dash-status ${tx.status === 'Hoàn Thành' ? 'dash-status-active' : 'dash-status-pending'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SettingsView() {
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
              defaultValue="John Doe"
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
              defaultValue="john@example.com"
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
              defaultValue="Nhà giáo dục đam mê và người học suốt đời."
              rows={3}
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
        >
          Lưu Thay Đổi
        </button>
      </div>
    </>
  );
}
