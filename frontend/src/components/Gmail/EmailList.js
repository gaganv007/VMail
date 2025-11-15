import React from 'react';
import { FiStar, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './EmailList.css';

const EmailList = ({ emails = [], onEmailSelect, onDelete, onStar, onEditDraft, folder }) => {
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

  const handleDelete = (e, emailId) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this email?')) {
      onDelete(emailId);
    }
  };

  const handleStar = (e, emailId, starred) => {
    e.stopPropagation();
    if (onStar) {
      onStar(emailId, !starred);
    }
  };

  const handleEditDraft = (e, email) => {
    e.stopPropagation();
    if (onEditDraft) {
      onEditDraft(email);
    }
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
              <div className="email-checkbox">
                <input type="checkbox" />
              </div>
              <div className="email-star" onClick={(e) => handleStar(e, email.emailId, email.starred)}>
                <FiStar fill={email.starred ? '#FFC000' : 'none'} color={email.starred ? '#FFC000' : '#ccc'} />
              </div>
              <div className="email-avatar">
                {getInitials(email.from)}
              </div>
              <div className="email-from">
                {email.from?.split('@')[0] || 'Unknown'}
              </div>
              <div className="email-subject">
                {email.isDraft && <span className="draft-badge">Draft</span>}
                {email.subject || '(no subject)'}
                {email.preview && (
                  <span className="email-preview"> - {email.preview}</span>
                )}
              </div>
              <div className="email-actions">
                {folder === 'drafts' && (
                  <button
                    className="action-btn"
                    onClick={(e) => handleEditDraft(e, email)}
                    title="Edit draft"
                  >
                    <FiEdit2 size={16} />
                  </button>
                )}
                <button
                  className="action-btn"
                  onClick={(e) => handleDelete(e, email.emailId)}
                  title={folder === 'trash' ? 'Permanently delete' : 'Delete'}
                >
                  <FiTrash2 size={16} />
                </button>
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
