import React, { createContext, useContext, useState, useCallback } from 'react';
import emailService from '../services/emailService';

const EmailContext = createContext(null);

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};

export const EmailProvider = ({ children }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);

  const fetchEmails = useCallback(async (folder = 'inbox') => {
    setLoading(true);
    setError(null);
    try {
      const data = await emailService.listEmails(folder);
      setEmails(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmail = useCallback(async (emailId) => {
    setLoading(true);
    setError(null);
    try {
      const email = await emailService.getEmail(emailId);
      setCurrentEmail(email);
      return email;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (emailData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await emailService.sendEmail(emailData);
      // Refresh inbox after sending
      await fetchEmails('sent');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEmails]);

  const deleteEmail = useCallback(async (emailId) => {
    setLoading(true);
    setError(null);
    try {
      await emailService.deleteEmail(emailId);
      // Remove from local state
      setEmails(emails.filter(email => email.emailId !== emailId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [emails]);

  const markAsRead = useCallback(async (emailId) => {
    try {
      await emailService.markAsRead(emailId);
      // Update local state
      setEmails(emails.map(email =>
        email.emailId === emailId ? { ...email, read: true } : email
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [emails]);

  const value = {
    emails,
    loading,
    error,
    currentEmail,
    fetchEmails,
    getEmail,
    sendEmail,
    deleteEmail,
    markAsRead
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};
