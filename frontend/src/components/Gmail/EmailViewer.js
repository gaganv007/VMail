import React from 'react';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import './EmailViewer.css';

const EmailViewer = ({ email, onClose, onDelete, onStar }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      onDelete(email.emailId);
    }
  };

  const handleStar = () => {
    if (onStar) {
      onStar(email.emailId, !email.starred);
    }
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
          <button className="icon-btn" onClick={handleStar} title={email.starred ? 'Unstar' : 'Star'}>
            <FiStar fill={email.starred ? '#FFC000' : 'none'} color={email.starred ? '#FFC000' : 'currentColor'} size={20} />
          </button>
          <button className="icon-btn" onClick={handleDelete} title="Delete">
            <FiTrash2 size={20} />
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

        {email.attachments && email.attachments.length > 0 && (
          <div className="email-attachments">
            <div className="attachments-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
              <span>{email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}</span>
            </div>
            <div className="attachments-list">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-icon">📎</div>
                  <div className="attachment-info">
                    <div className="attachment-name">{attachment.filename}</div>
                    <div className="attachment-size">
                      {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </div>
                  </div>
                  <button
                    className="attachment-download-btn"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:${attachment.contentType || 'application/octet-stream'};base64,${attachment.data}`;
                      link.download = attachment.filename;
                      link.click();
                    }}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailViewer;
