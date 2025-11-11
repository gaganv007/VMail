import React, { useState } from 'react';
import './ComposeWindow.css';

const ComposeWindow = ({ onClose, onSend }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject) {
      alert('Please fill in recipient and subject');
      return;
    }

    setSending(true);
    try {
      await onSend({ to, subject, body });
      onClose();
    } catch (err) {
      alert('Failed to send email: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-overlay" onClick={onClose}>
      <div className="compose-window" onClick={(e) => e.stopPropagation()}>
        <div className="compose-header">
          <div className="compose-title">New Message</div>
          <button className="compose-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="compose-body">
          <div className="compose-field">
            <div className="compose-label">To</div>
            <input
              type="email"
              className="compose-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          <div className="compose-field">
            <div className="compose-label">Subject</div>
            <input
              type="text"
              className="compose-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="compose-editor">
            <textarea
              className="compose-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
            />
          </div>
        </div>

        <div className="compose-footer">
          <button
            className="compose-send-btn"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeWindow;
