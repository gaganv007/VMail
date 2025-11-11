import React, { useState } from 'react';
import './EmailServiceSearch.css';

const EmailServiceSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const emailServices = [
    {
      id: 1,
      name: 'ProtonMail',
      description: 'Secure email with end-to-end encryption',
      url: 'https://proton.me/mail',
      type: 'secure',
      features: ['End-to-end encryption', 'Privacy focused', 'Free tier available'],
      logo: '🔒'
    },
    {
      id: 2,
      name: 'Temp Mail',
      description: 'Disposable temporary email addresses',
      url: 'https://temp-mail.org',
      type: 'temporary',
      features: ['Instant email', 'No registration', 'Auto-delete'],
      logo: '⏱️'
    },
    {
      id: 3,
      name: 'Guerrilla Mail',
      description: 'Disposable temporary email service',
      url: 'https://www.guerrillamail.com',
      type: 'temporary',
      features: ['No registration', 'Scramble address', 'Forget me option'],
      logo: '🎭'
    },
    {
      id: 4,
      name: '10 Minute Mail',
      description: 'Temporary email for 10 minutes',
      url: 'https://10minutemail.com',
      type: 'temporary',
      features: ['10-minute validity', 'Extendable', 'Simple interface'],
      logo: '⏰'
    },
    {
      id: 5,
      name: 'Tutanota',
      description: 'Encrypted email service from Germany',
      url: 'https://tutanota.com',
      type: 'secure',
      features: ['Encrypted', 'Open source', 'Free tier'],
      logo: '🛡️'
    },
    {
      id: 6,
      name: 'Zoho Mail',
      description: 'Ad-free business email',
      url: 'https://www.zoho.com/mail',
      type: 'business',
      features: ['Ad-free', 'Custom domain', 'Generous free tier'],
      logo: '💼'
    },
    {
      id: 7,
      name: 'Mailinator',
      description: 'Public email system for testing',
      url: 'https://www.mailinator.com',
      type: 'temporary',
      features: ['Public inboxes', 'No password', 'API access'],
      logo: '📬'
    },
    {
      id: 8,
      name: 'SimpleLogin',
      description: 'Email alias service',
      url: 'https://simplelogin.io',
      type: 'alias',
      features: ['Email aliases', 'Open source', 'Privacy protection'],
      logo: '🎭'
    },
    {
      id: 9,
      name: 'AnonAddy',
      description: 'Anonymous email forwarding',
      url: 'https://anonaddy.com',
      type: 'alias',
      features: ['Anonymous forwarding', 'Unlimited aliases', 'Open source'],
      logo: '👤'
    },
    {
      id: 10,
      name: 'Mail.com',
      description: 'Free email with multiple domains',
      url: 'https://www.mail.com',
      type: 'standard',
      features: ['200+ domain options', 'Generous storage', 'Mobile apps'],
      logo: '📧'
    }
  ];

  const filteredServices = emailServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || service.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleVisit = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getTypeColor = (type) => {
    const colors = {
      secure: '#10b981',
      temporary: '#f59e0b',
      business: '#3b82f6',
      alias: '#8b5cf6',
      standard: '#6b7280'
    };
    return colors[type] || colors.standard;
  };

  return (
    <div className="service-search-overlay">
      <div className="service-search-modal">
        <div className="search-header">
          <h2>Free Email Services</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="search-controls">
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="search-icon">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search email services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'secure' ? 'active' : ''}`}
              onClick={() => setFilter('secure')}
            >
              Secure
            </button>
            <button
              className={`filter-btn ${filter === 'temporary' ? 'active' : ''}`}
              onClick={() => setFilter('temporary')}
            >
              Temporary
            </button>
            <button
              className={`filter-btn ${filter === 'business' ? 'active' : ''}`}
              onClick={() => setFilter('business')}
            >
              Business
            </button>
            <button
              className={`filter-btn ${filter === 'alias' ? 'active' : ''}`}
              onClick={() => setFilter('alias')}
            >
              Alias
            </button>
          </div>
        </div>

        <div className="services-list">
          {filteredServices.length === 0 ? (
            <div className="empty-state">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p>No services found</p>
            </div>
          ) : (
            filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-logo">{service.logo}</div>
                <div className="service-content">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span
                      className="service-type"
                      style={{ backgroundColor: getTypeColor(service.type) }}
                    >
                      {service.type}
                    </span>
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-features">
                    {service.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="service-actions">
                  <button
                    className="visit-btn"
                    onClick={() => handleVisit(service.url)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                    </svg>
                    Visit Site
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="search-footer">
          <p className="footer-text">
            Discover and compare free email service providers
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailServiceSearch;
