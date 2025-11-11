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
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailCounts, setEmailCounts] = useState({
    inbox: 0,
    starred: 0,
    sent: 0,
    drafts: 0,
    trash: 0,
  });

  useEffect(() => {
    loadEmails();
    // eslint-disable-next-line
  }, [activeFolder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      console.log('Loading emails for folder:', activeFolder);
      const response = await EmailService.listEmails(activeFolder);
      console.log('Received emails:', response);
      const emailList = response.emails || [];
      console.log('Email count:', emailList.length);
      setEmails(emailList);
      setFilteredEmails(emailList);
    } catch (err) {
      console.error('Error loading emails:', err);
      setEmails([]);
      setFilteredEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredEmails(emails);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = emails.filter((email) => {
      return (
        email.subject?.toLowerCase().includes(searchLower) ||
        email.from?.toLowerCase().includes(searchLower) ||
        email.body?.toLowerCase().includes(searchLower) ||
        email.preview?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredEmails(filtered);
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
      // Switch to sent folder and reload
      setActiveFolder('sent');
      // Show success message
      alert('Email sent successfully!');
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
      <NavigationBar user={user} onSearch={handleSearch} />

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
              emails={filteredEmails}
              onEmailSelect={handleEmailSelect}
              searchQuery={searchQuery}
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
