import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import './Login.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        },
      });
      setSuccess('Verification code sent to your email!');
      setStep(2);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });
      setSuccess('Account verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="#1a73e8">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>

        <div className="auth-title">
          {step === 1 ? 'Create VMail Account' : 'Verify Your Email'}
        </div>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength="8"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
