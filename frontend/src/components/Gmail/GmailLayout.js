import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import NavigationBar from './NavigationBar';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import ComposeWindow from './ComposeWindow';
import EmailGenerator from '../EmailGenerator/EmailGenerator';
import EmailServiceSearch from '../EmailServiceSearch/EmailServiceSearch';
import EmailService from '../../services/emailService';
import './GmailLayout.css';

const GmailLayout = ({ user }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [showServiceSearch, setShowServiceSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailCounts, setEmailCounts] = useState({
    inbox: 0,
    starred: 0,
    snoozed: 0,
    drafts: 0,
    spam: 0,
    trash: 0,
  });

  useEffect(() => {
    loadEmails();
  }, [activeFolder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load emails from the API
      const response = await EmailService.listEmails(activeFolder);

      // Filter emails based on active folder
      let filteredEmails = response.emails || [];

      if (activeFolder === 'inbox') {
        filteredEmails = filteredEmails.filter(e => e.folder === 'inbox' || !e.folder);
      } else if (activeFolder === 'starred') {
        filteredEmails = filteredEmails.filter(e => e.starred);
      } else if (activeFolder === 'sent') {
        filteredEmails = filteredEmails.filter(e => e.folder === 'sent');
      } else if (activeFolder === 'drafts') {
        filteredEmails = filteredEmails.filter(e => e.folder === 'drafts');
      } else if (activeFolder === 'spam') {
        filteredEmails = filteredEmails.filter(e => e.folder === 'spam');
      } else if (activeFolder === 'trash') {
        filteredEmails = filteredEmails.filter(e => e.folder === 'trash');
      } else if (activeFolder.startsWith('label-')) {
        const labelName = activeFolder.replace('label-', '');
        filteredEmails = filteredEmails.filter(e => e.labels && e.labels.includes(labelName));
      }

      // Sort by timestamp (newest first)
      filteredEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setEmails(filteredEmails);

      // Update counts
      setEmailCounts({
        inbox: (response.emails || []).filter(e => (e.folder === 'inbox' || !e.folder) && !e.read).length,
        starred: (response.emails || []).filter(e => e.starred).length,
        snoozed: (response.emails || []).filter(e => e.snoozed).length,
        drafts: (response.emails || []).filter(e => e.folder === 'drafts').length,
        spam: (response.emails || []).filter(e => e.folder === 'spam').length,
        trash: (response.emails || []).filter(e => e.folder === 'trash').length,
      });
    } catch (err) {
      console.error('Error loading emails:', err);
      setError(err.message);
      // Show demo emails on error
      setEmails(getDemoEmails());
    } finally {
      setLoading(false);
    }
  };

  const getDemoEmails = () => {
    return [
      {
        emailId: '1',
        from: 'welcome@vmail.com',
        to: [user?.email || 'you@example.com'],
        subject: 'Welcome to VMail!',
        body: 'Thank you for using VMail. This is your Gmail-style email interface with custom email generation and free email service search capabilities.',
        timestamp: new Date().toISOString(),
        read: false,
        starred: false,
        labels: [],
        category: 'primary',
        hasAttachment: false,
        folder: 'inbox'
      },
      {
        emailId: '2',
        from: 'support@vmail.com',
        to: [user?.email || 'you@example.com'],
        subject: 'Getting Started with VMail',
        body: 'Here are some tips to get started:\n\n1. Click Compose to create a new email\n2. Use the sidebar to navigate between folders\n3. Search for free email services\n4. Generate custom email addresses',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        starred: true,
        labels: ['personal'],
        category: 'primary',
        hasAttachment: false,
        folder: 'inbox'
      },
      {
        emailId: '3',
        from: 'demo@example.com',
        to: [user?.email || 'you@example.com'],
        subject: 'Sample Email with Attachment',
        body: 'This is a sample email showing how attachments would appear in your inbox.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        starred: false,
        labels: ['work'],
        category: 'primary',
        hasAttachment: true,
        attachments: [
          {
            filename: 'document.pdf',
            size: 102400,
            s3Key: 'attachments/demo/document.pdf'
          }
        ],
        folder: 'inbox'
      }
    ];
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
  };

  const handleEmailSelect = async (email) => {
    setSelectedEmail(email);

    // Mark email as read
    if (!email.read) {
      try {
        await EmailService.markAsRead(email.emailId);
        // Update local state
        setEmails(emails.map(e =>
          e.emailId === email.emailId ? { ...e, read: true } : e
        ));
      } catch (err) {
        console.error('Error marking email as read:', err);
      }
    }
  };

  const handleCompose = () => {
    setShowCompose(true);
  };

  const handleSendEmail = async (emailData) => {
    try {
      await EmailService.sendEmail(emailData);
      setShowCompose(false);
      // Refresh emails
      await loadEmails();
    } catch (err) {
      throw new Error('Failed to send email: ' + err.message);
    }
  };

  const handleEmailAction = async (action, emailId) => {
    try {
      switch (action) {
        case 'star':
          const email = emails.find(e => e.emailId === emailId);
          setEmails(emails.map(e =>
            e.emailId === emailId ? { ...e, starred: !e.starred } : e
          ));
          break;
        case 'delete':
          await EmailService.deleteEmail(emailId);
          await loadEmails();
          setSelectedEmail(null);
          break;
        case 'archive':
          // Archive functionality would go here
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error performing email action:', err);
    }
  };

  const handleSearch = (query) => {
    // Search functionality would go here
    console.log('Searching for:', query);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="gmail-layout">
      <NavigationBar
        onMenuClick={handleMenuClick}
        user={user}
        onSearch={handleSearch}
      />

      <div className="gmail-main">
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={handleFolderChange}
          onCompose={handleCompose}
          emailCounts={emailCounts}
          onGenerateEmail={() => setShowEmailGenerator(true)}
          onSearchServices={() => setShowServiceSearch(true)}
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
              onReply={() => {
                setShowCompose(true);
              }}
              onForward={() => {
                setShowCompose(true);
              }}
              onDelete={() => handleEmailAction('delete', selectedEmail.emailId)}
              onArchive={() => handleEmailAction('archive', selectedEmail.emailId)}
            />
          ) : (
            <EmailList
              emails={emails}
              onEmailSelect={handleEmailSelect}
              selectedEmailId={selectedEmail?.emailId}
              onEmailAction={handleEmailAction}
            />
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeWindow
          onClose={() => setShowCompose(false)}
          onSend={handleSendEmail}
          replyTo={selectedEmail}
        />
      )}

      {showEmailGenerator && (
        <EmailGenerator onClose={() => setShowEmailGenerator(false)} />
      )}

      {showServiceSearch && (
        <EmailServiceSearch onClose={() => setShowServiceSearch(false)} />
      )}
    </div>
  );
};

export default GmailLayout;
