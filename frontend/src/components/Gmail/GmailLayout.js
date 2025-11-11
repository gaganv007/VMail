import React, { useState, useEffect } from 'react';
import NavigationBar from './NavigationBar';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import ComposeWindow from './ComposeWindow';
import EmailViewer from './EmailViewer';
import EmailService from '../../services/emailService';
import './GmailLayout.css';

const GmailLayout = ({ user }) => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailCounts, setEmailCounts] = useState({
    inbox: 0,
    starred: 0,
    sent: 0,
    drafts: 0,
    spam: 0,
    trash: 0,
  });

  useEffect(() => {
    loadEmails();
    // eslint-disable-next-line
  }, [activeFolder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await EmailService.listEmails(activeFolder);
      setEmails(response.emails || []);
    } catch (err) {
      console.error('Error loading emails:', err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const handleCompose = () => {
    setShowCompose(true);
  };

  const handleSendEmail = async (emailData) => {
    try {
      await EmailService.sendEmail(emailData);
      setShowCompose(false);
      if (activeFolder === 'sent') {
        await loadEmails();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEmail = async (emailId) => {
    try {
      await EmailService.deleteEmail(emailId);
      setSelectedEmail(null);
      await loadEmails();
    } catch (err) {
      console.error('Error deleting email:', err);
      alert('Failed to delete email');
    }
  };

  return (
    <div className="gmail-layout">
      <NavigationBar user={user} />

      <div className="gmail-main">
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={handleFolderChange}
          onCompose={handleCompose}
          emailCounts={emailCounts}
        />

        <div className="gmail-content">
          {loading ? (
            <div className="gmail-loading">
              <div className="spinner"></div>
              <p>Loading emails...</p>
            </div>
          ) : selectedEmail ? (
            <EmailViewer
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onDelete={handleDeleteEmail}
            />
          ) : (
            <EmailList
              emails={emails}
              onEmailSelect={handleEmailSelect}
            />
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeWindow
          onClose={() => setShowCompose(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default GmailLayout;
