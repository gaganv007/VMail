import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeFolder, onFolderChange, onCompose, emailCounts }) => {
  const folders = [
    { id: 'inbox', label: 'Inbox', icon: '📥', count: emailCounts.inbox },
    { id: 'starred', label: 'Starred', icon: '⭐', count: emailCounts.starred },
    { id: 'sent', label: 'Sent', icon: '📤', count: emailCounts.sent },
    { id: 'drafts', label: 'Drafts', icon: '📝', count: emailCounts.drafts },
    { id: 'trash', label: 'Trash', icon: '🗑️', count: emailCounts.trash },
  ];

  return (
    <div className="gmail-sidebar">
      <button className="compose-btn" onClick={onCompose}>
        <span style={{ fontSize: '24px' }}>✏️</span>
        <span>Compose</span>
      </button>

      <div className="folder-list">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
            onClick={() => onFolderChange(folder.id)}
          >
            <span className="folder-icon">{folder.icon}</span>
            <span>{folder.label}</span>
            {folder.count > 0 && (
              <span className="folder-count">{folder.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
