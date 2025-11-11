import React from 'react';
import './EmailList.css';

const EmailList = ({ emails = [], onEmailSelect }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (email) => {
    if (!email) return '?';
    return email[0].toUpperCase();
  };

  return (
    <div className="email-list-container">
      <div className="email-list-header">
        <div className="header-left">
          <button className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="email-list">
        {emails.length === 0 ? (
          <div className="empty-state">
            <p>No emails in this folder</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.emailId}
              className={`email-item ${!email.read ? 'unread' : ''}`}
              onClick={() => onEmailSelect(email)}
            >
              <div className="email-avatar">
                {getInitials(email.from)}
              </div>
              <div className="email-from">
                {email.from?.split('@')[0] || 'Unknown'}
              </div>
              <div className="email-subject">
                {email.subject || '(no subject)'}
                {email.preview && (
                  <span className="email-preview"> - {email.preview}</span>
                )}
              </div>
              <div className="email-time">
                {formatTime(email.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;
