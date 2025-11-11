import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEmail } from '../../context/EmailContext';
import Sidebar from './Sidebar';
import EmailList from '../Email/EmailList';
import EmailView from '../Email/EmailView';
import ComposeEmail from '../Email/ComposeEmail';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [showCompose, setShowCompose] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const { user, logout } = useAuth();
  const { fetchEmails } = useEmail();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmails(currentFolder);
  }, [currentFolder, fetchEmails]);

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFolderChange = (folder) => {
    setCurrentFolder(folder);
    navigate(`/dashboard/${folder}`);
  };

  return (
    <div className="dashboard">
      <Sidebar
        currentFolder={currentFolder}
        onFolderChange={handleFolderChange}
        onCompose={() => setShowCompose(true)}
        onLogout={handleLogout}
        userEmail={user?.signInDetails?.loginId || user?.username}
      />

      <div className="dashboard-content">
        <Routes>
          <Route
            path="/"
            element={<EmailList folder={currentFolder} />}
          />
          <Route
            path="/:folder"
            element={<EmailList folder={currentFolder} />}
          />
          <Route
            path="/email/:emailId"
            element={<EmailView />}
          />
        </Routes>
      </div>

      {showCompose && (
        <ComposeEmail onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
};

export default Dashboard;
