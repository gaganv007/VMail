import React, { useState } from 'react';
import './EmailGenerator.css';

const EmailGenerator = ({ onClose }) => {
  const [generationType, setGenerationType] = useState('custom');
  const [customName, setCustomName] = useState('');
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [domain, setDomain] = useState('@vmail.com');
  const [loading, setLoading] = useState(false);

  const domains = [
    '@vmail.com',
    '@vmail.io',
    '@vmail.app',
    '@mymail.dev'
  ];

  const generateRandomEmail = () => {
    const adjectives = ['swift', 'bright', 'clever', 'smart', 'quick', 'bold', 'cool', 'fast'];
    const nouns = ['eagle', 'tiger', 'fox', 'wolf', 'lion', 'hawk', 'bear', 'shark'];
    const numbers = Math.floor(Math.random() * 999);

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj}${noun}${numbers}${domain}`;
  };

  const handleGenerate = () => {
    setLoading(true);

    setTimeout(() => {
      let newEmails = [];

      if (generationType === 'custom' && customName) {
        // Generate variations of custom name
        newEmails = [
          `${customName}${domain}`,
          `${customName}${Math.floor(Math.random() * 999)}${domain}`,
          `${customName}.mail${domain}`,
          `${customName}_official${domain}`,
        ];
      } else if (generationType === 'random') {
        // Generate random email addresses
        newEmails = Array(5).fill(null).map(() => generateRandomEmail());
      } else if (generationType === 'temporary') {
        // Generate temporary email addresses
        const tempId = Math.random().toString(36).substring(2, 12);
        newEmails = [
          `temp_${tempId}${domain}`,
          `disposable_${tempId}${domain}`,
          `temp${Date.now()}${domain}`,
        ];
      }

      setGeneratedEmails(newEmails);
      setLoading(false);
    }, 500);
  };

  const handleCopy = (email) => {
    navigator.clipboard.writeText(email);
    alert(`Copied: ${email}`);
  };

  const handleCreate = async (email) => {
    try {
      // In a real implementation, this would call the backend API
      console.log('Creating email address:', email);
      alert(`Email address created: ${email}\n\nThis email is now ready to receive messages!`);
    } catch (error) {
      alert('Failed to create email address: ' + error.message);
    }
  };

  return (
    <div className="email-generator-overlay">
      <div className="email-generator-modal">
        <div className="generator-header">
          <h2>Generate Email Address</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="generator-body">
          <div className="generation-types">
            <button
              className={`type-btn ${generationType === 'custom' ? 'active' : ''}`}
              onClick={() => setGenerationType('custom')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Custom
            </button>
            <button
              className={`type-btn ${generationType === 'random' ? 'active' : ''}`}
              onClick={() => setGenerationType('random')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              Random
            </button>
            <button
              className={`type-btn ${generationType === 'temporary' ? 'active' : ''}`}
              onClick={() => setGenerationType('temporary')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              Temporary
            </button>
          </div>

          {generationType === 'custom' && (
            <div className="input-section">
              <label>Custom Email Name</label>
              <div className="input-group">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="yourname"
                  className="email-input"
                />
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="domain-select"
                >
                  {domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <small>Letters, numbers, dots, dashes, and underscores only</small>
            </div>
          )}

          {generationType === 'random' && (
            <div className="info-section">
              <p>Generate random email addresses with creative combinations</p>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="domain-select"
              >
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {generationType === 'temporary' && (
            <div className="info-section">
              <p>Generate temporary disposable email addresses</p>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="domain-select"
              >
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <small>Temporary emails expire after 24 hours</small>
            </div>
          )}

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || (generationType === 'custom' && !customName)}
          >
            {loading ? 'Generating...' : 'Generate Email Addresses'}
          </button>

          {generatedEmails.length > 0 && (
            <div className="results-section">
              <h3>Generated Email Addresses</h3>
              <div className="email-list">
                {generatedEmails.map((email, index) => (
                  <div key={index} className="email-item">
                    <span className="email-text">{email}</span>
                    <div className="email-actions">
                      <button
                        className="action-btn copy-btn"
                        onClick={() => handleCopy(email)}
                        title="Copy to clipboard"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </button>
                      <button
                        className="action-btn create-btn"
                        onClick={() => handleCreate(email)}
                        title="Create this email address"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Create
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;
