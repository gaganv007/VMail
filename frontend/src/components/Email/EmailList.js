import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../../context/EmailContext';
import { FiMail, FiPaperclip, FiRefreshCw } from 'react-icons/fi';
import './EmailList.css';

const EmailList = ({ folder }) => {
  const { emails, loading, fetchEmails } = useEmail();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmails(folder);
  }, [folder, fetchEmails]);

  const handleEmailClick = (emailId) => {
    navigate(`/dashboard/email/${emailId}`);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleRefresh = () => {
    fetchEmails(folder);
  };

  if (loading && emails.length === 0) {
    return (
      <div className="email-list-loading">
        <div className="spinner"></div>
        <p>Loading emails...</p>
      </div>
    );
  }

  return (
    <div className="email-list">
      <div className="email-list-header">
        <h2>{folder.charAt(0).toUpperCase() + folder.slice(1)}</h2>
        <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {emails.length === 0 ? (
        <div className="empty-state">
          <FiMail size={48} />
          <h3>No emails</h3>
          <p>Your {folder} is empty</p>
        </div>
      ) : (
        <div className="email-items">
          {emails.map((email) => (
            <div
              key={email.emailId}
              className={`email-item ${email.read ? 'read' : 'unread'}`}
              onClick={() => handleEmailClick(email.emailId)}
            >
              <div className="email-item-icon">
                {email.read ? <FiMail /> : <FiMail />}
              </div>

              <div className="email-item-content">
                <div className="email-item-header">
                  <span className="email-sender">
                    {folder === 'sent' ? `To: ${email.to}` : email.from}
                  </span>
                  <span className="email-date">{formatDate(email.timestamp)}</span>
                </div>

                <div className="email-subject">
                  {email.subject || '(No subject)'}
                  {email.hasAttachments && (
                    <FiPaperclip className="attachment-icon" />
                  )}
                </div>

                <div className="email-preview">
                  {email.preview || email.body?.substring(0, 100)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;
