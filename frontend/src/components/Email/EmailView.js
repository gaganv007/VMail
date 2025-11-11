import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmail } from '../../context/EmailContext';
import { FiArrowLeft, FiTrash2, FiDownload, FiCornerUpLeft } from 'react-icons/fi';
import ComposeEmail from './ComposeEmail';
import './EmailView.css';

const EmailView = () => {
  const { emailId } = useParams();
  const { getEmail, deleteEmail, markAsRead, currentEmail, loading } = useEmail();
  const navigate = useNavigate();
  const [showReply, setShowReply] = useState(false);

  const loadEmail = async () => {
    try {
      await getEmail(emailId);
      await markAsRead(emailId);
    } catch (error) {
      console.error('Error loading email:', error);
    }
  };

  useEffect(() => {
    if (emailId) {
      loadEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await deleteEmail(emailId);
        navigate(-1);
      } catch (error) {
        console.error('Error deleting email:', error);
      }
    }
  };

  const handleDownloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading || !currentEmail) {
    return (
      <div className="email-view-loading">
        <div className="spinner"></div>
        <p>Loading email...</p>
      </div>
    );
  }

  return (
    <div className="email-view">
      <div className="email-view-header">
        <button className="back-btn" onClick={handleBack}>
          <FiArrowLeft />
          <span>Back</span>
        </button>

        <div className="email-actions">
          <button className="action-btn" onClick={() => setShowReply(true)}>
            <FiCornerUpLeft />
            <span>Reply</span>
          </button>
          <button className="action-btn delete" onClick={handleDelete}>
            <FiTrash2 />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="email-view-content">
        <h1 className="email-subject">{currentEmail.subject || '(No subject)'}</h1>

        <div className="email-meta">
          <div className="sender-info">
            <div className="sender-avatar">
              {currentEmail.from?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sender-name">{currentEmail.fromName || currentEmail.from}</div>
              <div className="sender-email">{currentEmail.from}</div>
            </div>
          </div>
          <div className="email-timestamp">{formatDate(currentEmail.timestamp)}</div>
        </div>

        {currentEmail.to && (
          <div className="email-recipients">
            <span className="label">To:</span>
            <span className="value">{Array.isArray(currentEmail.to) ? currentEmail.to.join(', ') : currentEmail.to}</span>
          </div>
        )}

        {currentEmail.cc && currentEmail.cc.length > 0 && (
          <div className="email-recipients">
            <span className="label">Cc:</span>
            <span className="value">{currentEmail.cc.join(', ')}</span>
          </div>
        )}

        <div className="email-body" dangerouslySetInnerHTML={{ __html: currentEmail.body }} />

        {currentEmail.attachments && currentEmail.attachments.length > 0 && (
          <div className="attachments-section">
            <h3>Attachments ({currentEmail.attachments.length})</h3>
            <div className="attachments-list">
              {currentEmail.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-info">
                    <span className="attachment-name">{attachment.filename}</span>
                    <span className="attachment-size">
                      {(attachment.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    <FiDownload />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showReply && (
        <ComposeEmail
          onClose={() => setShowReply(false)}
          replyTo={currentEmail}
        />
      )}
    </div>
  );
};

export default EmailView;
