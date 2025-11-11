import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeFolder, onFolderChange, onCompose, emailCounts, onGenerateEmail, onSearchServices }) => {
  const mainFolders = [
    { id: 'inbox', label: 'Inbox', icon: 'inbox', count: emailCounts?.inbox || 0 },
    { id: 'starred', label: 'Starred', icon: 'star', count: emailCounts?.starred || 0 },
    { id: 'snoozed', label: 'Snoozed', icon: 'schedule', count: emailCounts?.snoozed || 0 },
    { id: 'sent', label: 'Sent', icon: 'send', count: null },
    { id: 'drafts', label: 'Drafts', icon: 'draft', count: emailCounts?.drafts || 0 },
    { id: 'spam', label: 'Spam', icon: 'warning', count: emailCounts?.spam || 0 },
    { id: 'trash', label: 'Trash', icon: 'delete', count: emailCounts?.trash || 0 },
  ];

  const [labels, setLabels] = React.useState([
    { id: 'personal', name: 'Personal', color: '#34A853' },
    { id: 'work', name: 'Work', color: '#EA4335' },
    { id: 'social', name: 'Social', color: '#4285F4' },
  ]);

  const [showLabels, setShowLabels] = React.useState(true);

  const getIcon = (iconName) => {
    const icons = {
      inbox: <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/>,
      star: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>,
      schedule: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>,
      send: <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>,
      draft: <path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/>,
      warning: <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>,
      delete: <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>,
    };
    return icons[iconName] || null;
  };

  return (
    <aside className="gmail-sidebar">
      <button className="compose-btn" onClick={onCompose}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M32 16H20V4a2 2 0 0 0-4 0v12H4a2 2 0 0 0 0 4h12v12a2 2 0 0 0 4 0V20h12a2 2 0 0 0 0-4z" fill="currentColor"/>
        </svg>
        Compose
      </button>

      <nav className="sidebar-nav">
        <div className="folder-list">
          {mainFolders.map((folder) => (
            <button
              key={folder.id}
              className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
              onClick={() => onFolderChange(folder.id)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {getIcon(folder.icon)}
              </svg>
              <span className="folder-label">{folder.label}</span>
              {folder.count > 0 && (
                <span className="folder-count">{folder.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="labels-section">
          <button
            className="labels-header"
            onClick={() => setShowLabels(!showLabels)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ transform: showLabels ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
            <span>Labels</span>
          </button>

          {showLabels && (
            <>
              <div className="label-list">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    className={`label-item ${activeFolder === `label-${label.id}` ? 'active' : ''}`}
                    onClick={() => onFolderChange(`label-${label.id}`)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={label.color}>
                      <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                    </svg>
                    <span className="label-name">{label.name}</span>
                  </button>
                ))}
              </div>
              <button className="create-label-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <span>Create new label</span>
              </button>
            </>
          )}
        </div>

        <div className="special-features-section">
          <button className="feature-btn generate-btn" onClick={onGenerateEmail}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Generate Email</span>
          </button>
          <button className="feature-btn search-btn" onClick={onSearchServices}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span>Search Services</span>
          </button>
        </div>

        <div className="settings-section">
          <button className="settings-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Manage Account</span>
          </button>
          <button className="settings-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </nav>

      <div className="storage-info">
        <div className="storage-bar">
          <div className="storage-used" style={{ width: '15%' }}></div>
        </div>
        <p className="storage-text">1.2 GB of 15 GB used</p>
      </div>
    </aside>
  );
};

export default Sidebar;
