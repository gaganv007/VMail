import React from 'react';
import './EmailList.css';

const EmailList = ({ emails = [], onEmailSelect, selectedEmailId, onEmailAction }) => {
  const [selectedEmails, setSelectedEmails] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('primary');

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(e => e.emailId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmail = (emailId, e) => {
    e.stopPropagation();
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  const handleEmailClick = (email) => {
    if (selectedEmails.length === 0) {
      onEmailSelect(email);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getInitials = (email) => {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const tabs = [
    { id: 'primary', label: 'Primary', icon: 'inbox' },
    { id: 'social', label: 'Social', icon: 'people' },
    { id: 'promotions', label: 'Promotions', icon: 'local_offer' },
  ];

  return (
    <div className="email-list-container">
      <div className="email-list-header">
        <div className="header-left">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
          </label>
          <button className="icon-btn" aria-label="Refresh">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
          {selectedEmails.length > 0 && (
            <>
              <button className="icon-btn" aria-label="Archive">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                </svg>
              </button>
              <button className="icon-btn" aria-label="Delete">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
              <button className="icon-btn" aria-label="Mark as read">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="header-right">
          <span className="pagination-info">1-{emails.length} of {emails.length}</span>
          <button className="icon-btn" aria-label="Newer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="Older">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="email-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`email-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              {tab.icon === 'inbox' && <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/>}
              {tab.icon === 'people' && <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>}
              {tab.icon === 'local_offer' && <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>}
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="email-list">
        {emails.length === 0 ? (
          <div className="empty-state">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
              <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/>
            </svg>
            <p>No emails in this folder</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.emailId}
              className={`email-item ${selectedEmailId === email.emailId ? 'selected' : ''} ${!email.read ? 'unread' : ''}`}
              onClick={() => handleEmailClick(email)}
            >
              <label className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(email.emailId)}
                  onChange={(e) => handleSelectEmail(email.emailId, e)}
                />
              </label>
              <button
                className="star-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEmailAction && onEmailAction('star', email.emailId);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={email.starred ? '#f59e0b' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </button>
              <div className="email-avatar">
                {getInitials(email.from)}
              </div>
              <div className="email-content">
                <div className="email-info">
                  <span className="email-from">{email.from?.split('@')[0] || 'Unknown'}</span>
                  <span className="email-subject">
                    {email.subject || '(no subject)'}
                  </span>
                  {email.preview && (
                    <span className="email-preview">
                      {' - ' + truncateText(email.preview || email.body || '', 50)}
                    </span>
                  )}
                </div>
              </div>
              {email.hasAttachment && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="attachment-icon">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              )}
              <span className="email-time">{formatTime(email.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;
