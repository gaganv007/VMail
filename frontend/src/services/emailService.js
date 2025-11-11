import { fetchAuthSession } from 'aws-amplify/auth';
import { apiConfig } from '../config/aws-config';

class EmailService {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  }

  async getAuthHeaders() {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw new Error('Authentication required');
    }
  }

  async listEmails(folder = 'inbox', limit = 50) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiEndpoint}${apiConfig.endpoints.listEmails}?folder=${folder}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing emails:', error);
      throw error;
    }
  }

  async getEmail(emailId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiEndpoint}${apiConfig.endpoints.getEmail}/${emailId}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch email: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  }

  async sendEmail(emailData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiEndpoint}${apiConfig.endpoints.sendEmail}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: emailData.to,
            subject: emailData.subject,
            body: emailData.body,
            cc: emailData.cc || [],
            bcc: emailData.bcc || [],
            attachments: emailData.attachments || []
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async deleteEmail(emailId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiEndpoint}${apiConfig.endpoints.deleteEmail}/${emailId}`,
        {
          method: 'DELETE',
          headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete email: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  async markAsRead(emailId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.apiEndpoint}${apiConfig.endpoints.getEmail}/${emailId}/read`,
        {
          method: 'PUT',
          headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark email as read: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  async uploadAttachment(file) {
    try {
      // Convert file to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve({
            filename: file.name,
            contentType: file.type,
            data: reader.result.split(',')[1], // Remove data:*/*;base64, prefix
            size: file.size
          });
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }
}

const emailServiceInstance = new EmailService();

export default emailServiceInstance;
