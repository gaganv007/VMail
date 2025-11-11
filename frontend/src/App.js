import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { awsConfig } from './config/aws-config';
import { AuthProvider } from './context/AuthContext';
import { EmailProvider } from './context/EmailContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import GmailLayout from './components/Gmail/GmailLayout';
import './App.css';

// Configure Amplify
Amplify.configure(awsConfig);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading VMail...</p>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <EmailProvider>
          <div className="App">
            <Routes>
              <Route
                path="/login"
                element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/signup"
                element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/dashboard/*"
                element={isAuthenticated ? <GmailLayout user={user} /> : <Navigate to="/login" />}
              />
              <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
              />
            </Routes>
          </div>
        </EmailProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
