import React from 'react';
import './EmailViewer.css';

const EmailViewer = ({ email, onClose, onReply, onForward, onDelete, onArchive }) => {
  if (!email) {
    return (
      <div className="email-viewer-empty">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <p>Select an email to read</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / 3600000);

    if (diffHours < 1) {
      const diffMins = Math.floor((now - date) / 60000);
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getInitials = (emailAddress) => {
    if (!emailAddress) return '?';
    const parts = emailAddress.split('@')[0].split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return emailAddress[0].toUpperCase();
  };

  const formatEmailAddress = (emailAddress) => {
    if (!emailAddress) return 'Unknown';
    return emailAddress.split('@')[0].replace(/[._]/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="email-viewer">
      <div className="viewer-header">
        <button className="icon-btn" onClick={onClose} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="header-actions">
          <button className="icon-btn" onClick={onArchive} aria-label="Archive">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="Report spam">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </button>
          <button className="icon-btn" onClick={onDelete} aria-label="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="Mark as unread">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="Snooze">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="More">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="viewer-content">
        <div className="email-header">
          <h1 className="email-subject">{email.subject || '(no subject)'}</h1>
          <div className="email-labels">
            {email.labels?.map((label, index) => (
              <span key={index} className="email-label" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="sender-info">
          <div className="sender-avatar">
            {getInitials(email.from)}
          </div>
          <div className="sender-details">
            <div className="sender-name">
              <span className="name">{formatEmailAddress(email.from)}</span>
              <span className="email-address">&lt;{email.from}&gt;</span>
            </div>
            <div className="recipient-info">
              <span className="recipient-label">to </span>
              <span className="recipient-name">me</span>
              <button className="show-details-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="email-meta">
            <span className="email-time">{formatTime(email.timestamp)}</span>
            <button className="icon-btn star-btn" aria-label="Star">
              <svg width="20" height="20" viewBox="0 0 24 24" fill={email.starred ? '#f59e0b' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </button>
            <button className="icon-btn" aria-label="Reply">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
              </svg>
            </button>
            <button className="icon-btn" aria-label="More">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="attachments-section">
            <div className="attachments-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
              <span>{email.attachments.length} Attachment{email.attachments.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="attachments-list">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  <div className="attachment-info">
                    <span className="attachment-name">{attachment.filename}</span>
                    <span className="attachment-size">{(attachment.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button className="icon-btn download-btn" aria-label="Download">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="email-body">
          {email.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
          ) : (
            <p style={{ whiteSpace: 'pre-wrap' }}>{email.body}</p>
          )}
        </div>

        <div className="email-actions">
          <button className="action-btn reply-btn" onClick={onReply}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
            </svg>
            Reply
          </button>
          <button className="action-btn forward-btn" onClick={onForward}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8V4l8 8-8 8v-4H4V8z"/>
            </svg>
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;
