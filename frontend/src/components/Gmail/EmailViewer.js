import React from 'react';
import './EmailViewer.css';

const EmailViewer = ({ email, onClose, onDelete }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="email-viewer">
      <div className="viewer-header">
        <button className="viewer-back-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        <div className="viewer-actions">
          <button className="icon-btn" onClick={() => onDelete(email.emailId)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="viewer-content">
        <div className="email-subject">{email.subject || '(no subject)'}</div>

        <div className="email-meta">
          <div className="email-avatar">
            {email.from?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="email-sender">
            <div className="sender-name">{email.from?.split('@')[0] || 'Unknown'}</div>
            <div className="sender-email">{email.from}</div>
          </div>
          <div className="email-date">{formatDate(email.timestamp)}</div>
        </div>

        <div
          className="email-body"
          dangerouslySetInnerHTML={{ __html: email.body || email.preview || '(no content)' }}
        />
      </div>
    </div>
  );
};

export default EmailViewer;
