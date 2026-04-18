import { useId, useState } from 'react';
import { NAV_CATALOG } from './navbarCatalogConfig';
import './NavbarCatalog.css';

const CatalogBurger = () => (
  <span className="navbar-catalog-burger" aria-hidden>
    <span className="navbar-catalog-burger-line" />
    <span className="navbar-catalog-burger-line" />
    <span className="navbar-catalog-burger-line" />
  </span>
);

/**
 * @param {'desktop' | 'mobile'} mode
 * @param {(category: string, query: string) => void} onPick — query rỗng = chỉ lọc theo category
 * @param {boolean} catalogActive — highlight khi đang xem trang chủ có ?category
 */
export default function NavbarCatalog({ mode, onPick, catalogActive }) {
  const desktopPanelId = useId();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleLeaf = (category) => {
    onPick(category, '');
  };

  const handleChild = (parentCategory, query) => {
    onPick(parentCategory, query == null ? '' : String(query));
  };

  const activeItem = NAV_CATALOG[activeIndex] ?? NAV_CATALOG[0];

  if (mode === 'mobile') {
    return (
      <div className="navbar-catalog navbar-catalog--mobile" role="navigation" aria-label="Danh mục sản phẩm">
        <div className="navbar-catalog-mobile-pill" aria-hidden>
          <CatalogBurger />
          <span>Danh mục</span>
        </div>
        {NAV_CATALOG.map((item, i) => {
          if (item.children) {
            return (
              <details key={i} className="navbar-catalog-mobile-details">
                <summary className="navbar-catalog-mobile-summary">{item.label}</summary>
                <ul className="navbar-catalog-mobile-sublist">
                  {item.children.map((ch, j) => (
                    <li key={j}>
                      <button
                        type="button"
                        className="navbar-catalog-mobile-link"
                        onClick={() => {
                          handleChild(item.category, ch.query);
                        }}
                      >
                        {ch.icon && <span className="navbar-catalog-mobile-link-icon">{ch.icon}</span>}
                        {ch.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            );
          }
          return (
            <button
              key={i}
              type="button"
              className="navbar-catalog-mobile-toplink"
              onClick={() => handleLeaf(item.category)}
            >
              {item.leafIcon && <span className="navbar-catalog-mobile-link-icon">{item.leafIcon}</span>}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`navbar-catalog navbar-catalog--desktop ${catalogActive ? 'navbar-catalog--active' : ''}`}
      role="navigation"
      aria-label="Danh mục sản phẩm"
      onMouseLeave={() => setActiveIndex(0)}
    >
      <button
        type="button"
        className={`navbar-catalog-trigger ${catalogActive ? 'is-active-route' : ''}`}
        aria-expanded="false"
        aria-haspopup="true"
        aria-controls={desktopPanelId}
      >
        <CatalogBurger />
        <span className="navbar-catalog-trigger-text">Danh mục</span>
      </button>
      <div
        id={desktopPanelId}
        className="navbar-catalog-mega"
        role="presentation"
        onMouseEnter={() => {
          if (activeIndex < 0 || activeIndex >= NAV_CATALOG.length) setActiveIndex(0);
        }}
      >
        <div className="navbar-catalog-mega-sidebar" role="menu">
          {NAV_CATALOG.map((item, i) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`navbar-catalog-mega-sidebar-item ${activeIndex === i ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
                onClick={() => {
                  if (!hasChildren) handleLeaf(item.category);
                }}
              >
                <span className="navbar-catalog-mega-sidebar-label">{item.label}</span>
                {hasChildren && (
                  <span className="navbar-catalog-mega-sidebar-chevron" aria-hidden>›</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="navbar-catalog-mega-main">
          {activeItem && (
            <>
              <h3 className="navbar-catalog-mega-heading">{activeItem.label}</h3>
              {activeItem.children?.length ? (
                <div className="navbar-catalog-mega-grid" role="menu">
                  {activeItem.children.map((ch) => (
                    <button
                      key={ch.label}
                      type="button"
                      className="navbar-catalog-mega-tile"
                      role="menuitem"
                      onClick={() => handleChild(activeItem.category, ch.query)}
                    >
                      <span className="navbar-catalog-mega-tile-icon-wrap">
                        <span className="navbar-catalog-mega-tile-icon">{ch.icon ?? '📎'}</span>
                      </span>
                      <span className="navbar-catalog-mega-tile-label">{ch.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="navbar-catalog-mega-leaf">
                  <button
                    type="button"
                    className="navbar-catalog-mega-tile navbar-catalog-mega-tile--wide"
                    onClick={() => handleLeaf(activeItem.category)}
                  >
                    <span className="navbar-catalog-mega-tile-icon-wrap navbar-catalog-mega-tile-icon-wrap--lg">
                      <span className="navbar-catalog-mega-tile-icon">{activeItem.leafIcon ?? '📚'}</span>
                    </span>
                    <span className="navbar-catalog-mega-tile-label">
                      Xem toàn bộ sản phẩm · {activeItem.label}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
