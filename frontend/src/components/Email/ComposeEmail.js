import React, { useState } from 'react';
import { useEmail } from '../../context/EmailContext';
import { FiX, FiSend, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import emailService from '../../services/emailService';
import './ComposeEmail.css';

const ComposeEmail = ({ onClose, replyTo }) => {
  const [formData, setFormData] = useState({
    to: replyTo?.from || '',
    cc: '',
    bcc: '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    body: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { sendEmail } = useEmail();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedAttachments = [];

    for (const file of files) {
      try {
        const attachment = await emailService.uploadAttachment(file);
        uploadedAttachments.push(attachment);
      } catch (error) {
        console.error('Error uploading file:', error);
        setError(`Failed to upload ${file.name}`);
      }
    }

    setAttachments([...attachments, ...uploadedAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      const emailData = {
        to: formData.to.split(',').map(email => email.trim()),
        cc: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
        bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
        subject: formData.subject,
        body: formData.body,
        attachments: attachments
      };

      await sendEmail(emailData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-overlay">
      <div className="compose-modal">
        <div className="compose-header">
          <h2>{replyTo ? 'Reply' : 'New Message'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="compose-form">
          {error && <div className="compose-error">{error}</div>}

          <div className="compose-field">
            <label>To:</label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="recipient@example.com"
              required
            />
          </div>

          <div className="compose-field">
            <label>Cc:</label>
            <input
              type="text"
              name="cc"
              value={formData.cc}
              onChange={handleChange}
              placeholder="cc@example.com (optional)"
            />
          </div>

          <div className="compose-field">
            <label>Bcc:</label>
            <input
              type="text"
              name="bcc"
              value={formData.bcc}
              onChange={handleChange}
              placeholder="bcc@example.com (optional)"
            />
          </div>

          <div className="compose-field">
            <label>Subject:</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Email subject"
              required
            />
          </div>

          <div className="compose-field compose-body">
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Write your message..."
              rows="12"
              required
            />
          </div>

          {attachments.length > 0 && (
            <div className="attachments-preview">
              {attachments.map((attachment, index) => (
                <div key={index} className="attachment-chip">
                  <FiPaperclip />
                  <span>{attachment.filename}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="remove-attachment"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="compose-actions">
            <label className="attach-btn">
              <FiPaperclip />
              <span>Attach</span>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>

            <div className="compose-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="send-btn"
                disabled={sending}
              >
                <FiSend />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEmail;
