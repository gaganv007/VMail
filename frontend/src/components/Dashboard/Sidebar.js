import React from 'react';
import { FiInbox, FiSend, FiFile, FiTrash2, FiEdit, FiLogOut, FiMail } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ currentFolder, onFolderChange, onCompose, onLogout, userEmail }) => {
  const folders = [
    { id: 'inbox', label: 'Inbox', icon: <FiInbox /> },
    { id: 'sent', label: 'Sent', icon: <FiSend /> },
    { id: 'drafts', label: 'Drafts', icon: <FiFile /> },
    { id: 'trash', label: 'Trash', icon: <FiTrash2 /> }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <FiMail size={24} />
          <h2>VMail</h2>
        </div>
        <button className="compose-btn" onClick={onCompose}>
          <FiEdit />
          <span>Compose</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {folders.map((folder) => (
          <button
            key={folder.id}
            className={`nav-item ${currentFolder === folder.id ? 'active' : ''}`}
            onClick={() => onFolderChange(folder.id)}
          >
            {folder.icon}
            <span>{folder.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <p className="user-email">{userEmail}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
