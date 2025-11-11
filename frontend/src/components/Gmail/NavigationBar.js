import React from 'react';
import './NavigationBar.css';

const NavigationBar = ({ onMenuClick, user, onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header className="gmail-navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
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
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#5f6368">
            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
          </svg>
          <input
            type="text"
            placeholder="Search mail"
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="navbar-right">
        <button className="profile-btn">
          {user?.email?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  );
};

export default NavigationBar;
