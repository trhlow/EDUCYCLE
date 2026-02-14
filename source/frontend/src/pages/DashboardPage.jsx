import { useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

const SIDEBAR_ITEMS = [
  { icon: '📊', label: 'Overview', view: 'overview' },
  { icon: '📚', label: 'My Products', view: 'products' },
  { icon: '🛒', label: 'Purchases', view: 'purchases' },
  { icon: '💰', label: 'Sales History', view: 'sales' },
  { icon: '⚙️', label: 'Settings', view: 'settings' },
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
          Logout
        </button>

        {sidebarOpen && (
          <button
            className="dash-sidebar-link"
            onClick={() => setSidebarOpen(false)}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <span className="dash-sidebar-link-icon">✕</span>
            Close Menu
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
      <h1 className="dash-welcome">Welcome back, John! 👋</h1>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-value">12</div>
          <div className="dash-stat-label">Courses</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">$2,450</div>
          <div className="dash-stat-label">Total Earned</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">4.8</div>
          <div className="dash-stat-label">Avg Rating</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">856</div>
          <div className="dash-stat-label">Students</div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">My Courses</h2>
          <Link to="#" className="dash-section-action">+ Add New</Link>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Students</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="dash-table-product">
                  <span className="dash-table-product-icon">📘</span>
                  <span className="dash-table-product-name">Advanced Python</span>
                </div>
              </td>
              <td>234</td>
              <td>$1,234</td>
              <td><span className="dash-status dash-status-active">Active</span></td>
            </tr>
            <tr>
              <td>
                <div className="dash-table-product">
                  <span className="dash-table-product-icon">📗</span>
                  <span className="dash-table-product-name">React Basics</span>
                </div>
              </td>
              <td>156</td>
              <td>$890</td>
              <td><span className="dash-status dash-status-active">Active</span></td>
            </tr>
            <tr>
              <td>
                <div className="dash-table-product">
                  <span className="dash-table-product-icon">📙</span>
                  <span className="dash-table-product-name">UI Design Course</span>
                </div>
              </td>
              <td>89</td>
              <td>$445</td>
              <td><span className="dash-status dash-status-draft">Draft</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Transactions</h2>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Feb 14, 2024</td>
              <td><span className="dash-tx-type dash-tx-purchase">Purchase</span></td>
              <td>Advanced Python</td>
              <td>-$49.99</td>
            </tr>
            <tr>
              <td>Feb 13, 2024</td>
              <td><span className="dash-tx-type dash-tx-sale">Sale</span></td>
              <td>React Basics</td>
              <td>+$89.99</td>
            </tr>
            <tr>
              <td>Feb 12, 2024</td>
              <td><span className="dash-tx-type dash-tx-sale">Sale</span></td>
              <td>Advanced Python</td>
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
      <h1 className="dash-welcome">My Products</h1>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">All Products</h2>
          <button className="dash-section-action">+ Add New Product</button>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { icon: '📘', name: 'Advanced Python', status: 'active', price: '$49.99' },
              { icon: '📗', name: 'React Basics', status: 'active', price: '$89.99' },
              { icon: '📙', name: 'UI Design Course', status: 'draft', price: '$59.99' },
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
                    {product.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td>{product.price}</td>
                <td>
                  <div className="dash-table-actions">
                    <button className="dash-table-btn">Edit</button>
                    <button className="dash-table-btn dash-table-btn-danger">Delete</button>
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
      <h1 className="dash-welcome">My Purchases</h1>

      <div className="dash-section">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Seller</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Feb 14, 2024', course: 'Advanced Python', seller: 'CodeMaster Pro', amount: '$49.99', status: 'Complete' },
              { date: 'Feb 10, 2024', course: 'Web Development', seller: 'WebDev Academy', amount: '$89.99', status: 'Complete' },
              { date: 'Feb 5, 2024', course: 'Data Science', seller: 'DataPro Institute', amount: '$69.99', status: 'Complete' },
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
      <h1 className="dash-welcome">Sales History</h1>

      <div className="dash-stats" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-value">$2,450</div>
          <div className="dash-stat-label">Total Revenue</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">48</div>
          <div className="dash-stat-label">Total Sales</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value">$51.04</div>
          <div className="dash-stat-label">Avg Order Value</div>
        </div>
      </div>

      <div className="dash-section">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Feb 14, 2024', buyer: 'Alice K.', course: 'Advanced Python', amount: '$49.99', status: 'Complete' },
              { date: 'Feb 13, 2024', buyer: 'Bob M.', course: 'React Basics', amount: '$89.99', status: 'Complete' },
              { date: 'Feb 12, 2024', buyer: 'Carol J.', course: 'Advanced Python', amount: '$49.99', status: 'Pending' },
            ].map((tx, i) => (
              <tr key={i}>
                <td>{tx.date}</td>
                <td>{tx.buyer}</td>
                <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.course}</span></td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>+{tx.amount}</td>
                <td>
                  <span className={`dash-status ${tx.status === 'Complete' ? 'dash-status-active' : 'dash-status-pending'}`}>
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
      <h1 className="dash-welcome">Account Settings</h1>

      <div className="dash-section" style={{ padding: 'var(--space-6)' }}>
        <h3 className="dash-section-title" style={{ marginBottom: 'var(--space-6)' }}>Profile Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
              Full Name
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
              Bio
            </label>
            <textarea
              defaultValue="Passionate educator and lifelong learner."
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
          Save Changes
        </button>
      </div>
    </>
  );
}
