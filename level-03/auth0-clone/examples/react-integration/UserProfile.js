import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * UserProfile component for displaying and updating user information
 */
const UserProfile = () => {
  const { user, updateProfile, changePassword, logout, error } = useAuth();
  const navigate = useNavigate();
  
  // State for profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    picture: user?.picture || ''
  });
  
  // State for password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for form submission and errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setProfileSuccess(false);
    
    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setProfileSuccess(true);
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setProfileSuccess(false);
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess(false);
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setPasswordSuccess(true);
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setPasswordError('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Call API to delete account
        // This would require adding a deleteAccount method to AuthContext
        
        // Logout after successful deletion
        await logout();
        navigate('/');
      } catch (err) {
        console.error('Error deleting account:', err);
      }
    }
  };
  
  if (!user) {
    return <div className="loading">Loading user profile...</div>;
  }
  
  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-sections">
        <div className="profile-section">
          <h3>Profile Information</h3>
          
          {profileSuccess && (
            <div className="success-message">
              Profile updated successfully!
            </div>
          )}
          
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={isSubmitting || user.socialLogins?.length > 0}
              />
              {user.socialLogins?.length > 0 && (
                <small>Email cannot be changed for social login accounts</small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="picture">Profile Picture URL</label>
              <input
                type="url"
                id="picture"
                name="picture"
                value={profileData.picture}
                onChange={handleProfileChange}
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
        
        <div className="profile-section">
          <h3>Change Password</h3>
          
          {passwordSuccess && (
            <div className="success-message">
              Password changed successfully!
            </div>
          )}
          
          {passwordError && (
            <div className="error-message">
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                disabled={isSubmitting || user.socialLogins?.length > 0}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={isSubmitting || user.socialLogins?.length > 0}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={isSubmitting || user.socialLogins?.length > 0}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || user.socialLogins?.length > 0}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
            
            {user.socialLogins?.length > 0 && (
              <small>Password change is not available for social login accounts</small>
            )}
          </form>
        </div>
      </div>
      
      <div className="profile-section danger-zone">
        <h3>Danger Zone</h3>
        <p>Permanently delete your account and all associated data.</p>
        <button 
          className="btn-danger"
          onClick={handleDeleteAccount}
          disabled={isSubmitting}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
