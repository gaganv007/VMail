import React, { useState, useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';
import NavigationBar from './NavigationBar';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import ComposeWindow from './ComposeWindow';
import EmailViewer from './EmailViewer';
import EmailService from '../../services/emailService';
import './GmailLayout.css';

const GmailLayout = ({ user, onLogout }) => {
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
  const [editingDraftId, setEditingDraftId] = useState(null);

  // Load emails when component mounts and when folder changes
  useEffect(() => {
    loadEmails();
    loadEmailCounts();
    // Set up auto-load every 30 seconds
    const interval = setInterval(() => {
      loadEmails();
      loadEmailCounts();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [activeFolder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      console.log('Loading emails for folder:', activeFolder);
      
      let emailList = [];
      
      // For starred folder, fetch all folders and filter by starred
      if (activeFolder === 'starred') {
        const folders = ['inbox', 'sent', 'drafts'];
        const allEmails = [];
        for (const folder of folders) {
          const response = await EmailService.listEmails(folder);
          const folderEmails = response.emails || [];
          allEmails.push(...folderEmails.filter(e => e.starred));
        }
        emailList = allEmails;
      } else {
        // For other folders, fetch normally
        const response = await EmailService.listEmails(activeFolder);
        emailList = response.emails || [];
      }
      
      console.log('Received emails:', emailList);
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

  const loadEmailCounts = async () => {
    try {
      const folders = ['inbox', 'sent', 'drafts', 'trash'];
      const counts = {};
      for (const folder of folders) {
        const response = await EmailService.listEmails(folder);
        counts[folder] = response.emails?.length || 0;
      }
      // Get starred count from all folders (inbox, sent, drafts)
      let starredCount = 0;
      const starredFolders = ['inbox', 'sent', 'drafts'];
      for (const folder of starredFolders) {
        const response = await EmailService.listEmails(folder);
        starredCount += (response.emails?.filter(e => e.starred)?.length || 0);
      }
      counts.starred = starredCount;
      setEmailCounts(counts);
    } catch (err) {
      console.error('Error loading email counts:', err);
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

  const handleEmailSelect = async (email) => {
    try {
      console.log('Fetching full email:', email.emailId);
      const fullEmail = await EmailService.getEmail(email.emailId);
      console.log('Full email loaded:', fullEmail);
      setSelectedEmail(fullEmail);
      // Mark as read
      if (!email.read) {
        await EmailService.markAsRead(email.emailId);
        // Reload emails to update read status
        await loadEmails();
      }
    } catch (err) {
      console.error('Error loading email:', err);
      alert('Failed to load email content');
    }
  };

  const handleCompose = () => {
    setEditingDraftId(null);
    setShowCompose(true);
  };

  const handleEditDraft = (draft) => {
    setEditingDraftId(draft.emailId);
    setShowCompose(true);
  };

  const handleSendEmail = async (emailData) => {
    try {
      await EmailService.sendEmail(emailData);
      setShowCompose(false);
      setEditingDraftId(null);
      // Switch to sent folder and reload
      setActiveFolder('sent');
      // Show success message
      alert('Email sent successfully!');
      await loadEmailCounts();
    } catch (err) {
      throw err;
    }
  };

  const handleSaveDraft = async (emailData) => {
    try {
      await EmailService.saveDraft(emailData, editingDraftId);
      setShowCompose(false);
      setEditingDraftId(null);
      setActiveFolder('drafts');
      alert('Draft saved successfully!');
      await loadEmails();
      await loadEmailCounts();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEmail = async (emailId) => {
    try {
      await EmailService.deleteEmail(emailId);
      setSelectedEmail(null);
      await loadEmails();
      await loadEmailCounts();
    } catch (err) {
      console.error('Error deleting email:', err);
      alert('Failed to delete email');
    }
  };

  const handleStarEmail = async (emailId, starred) => {
    try {
      await EmailService.markAsStarred(emailId, starred);
      await loadEmails();
      await loadEmailCounts();
    } catch (err) {
      console.error('Error starring email:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="gmail-layout">
      <NavigationBar user={user} onSearch={handleSearch} onLogout={handleLogout} />

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
              onStar={handleStarEmail}
            />
          ) : (
            <EmailList
              emails={filteredEmails}
              onEmailSelect={handleEmailSelect}
              onDelete={handleDeleteEmail}
              onStar={handleStarEmail}
              onEditDraft={handleEditDraft}
              searchQuery={searchQuery}
              folder={activeFolder}
            />
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeWindow
          onClose={() => {
            setShowCompose(false);
            setEditingDraftId(null);
          }}
          onSend={handleSendEmail}
          onSaveDraft={handleSaveDraft}
          draftId={editingDraftId}
          draft={editingDraftId ? selectedEmail : null}
        />
      )}
    </div>
  );
};

export default GmailLayout;
