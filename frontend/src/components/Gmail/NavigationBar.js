import React from 'react';
import './NavigationBar.css';

const NavigationBar = ({ onMenuClick, user, onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="gmail-navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <div className="gmail-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M2 6L16 18L30 6V26H2V6Z" fill="#EA4335"/>
            <path d="M30 6L16 18L2 6L16 2L30 6Z" fill="#FBBC04"/>
            <path d="M16 18L2 6V26L16 18Z" fill="#34A853"/>
            <path d="M16 18L30 26V6L16 18Z" fill="#4285F4"/>
          </svg>
          <span className="gmail-text">VMail</span>
        </div>
      </div>

      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <button type="button" className="search-icon" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search mail"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="button" className="search-filter" aria-label="Show search options">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
          </button>
        </form>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" aria-label="Support">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
        </button>
        <button className="icon-btn" aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
          </svg>
        </button>
        <button className="icon-btn" aria-label="Google apps">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
          </svg>
        </button>
        <button className="profile-btn" aria-label="Account">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </button>
      </div>
    </header>
  );
};

export default NavigationBar;
