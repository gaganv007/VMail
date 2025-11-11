import React, { useState } from 'react';
import './ComposeWindow.css';

const ComposeWindow = ({ onClose, onSend }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              filename: file.name,
              contentType: file.type,
              data: reader.result.split(',')[1],
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    setAttachments([...attachments, ...processedFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to || !subject) {
      alert('Please fill in recipient and subject');
      return;
    }

    setSending(true);
    try {
      await onSend({ to, subject, body, attachments });
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

          {attachments.length > 0 && (
            <div className="compose-attachments">
              {attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span className="attachment-icon">📎</span>
                  <span className="attachment-name">{file.filename}</span>
                  <span className="attachment-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    className="attachment-remove"
                    onClick={() => removeAttachment(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="compose-footer">
          <button
            className="compose-send-btn"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
          <label className="compose-attach-btn">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <span>📎 Attach</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ComposeWindow;
