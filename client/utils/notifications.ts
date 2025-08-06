import { toast } from 'sonner';

export const showAuthSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

export const showAuthError = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    action: {
      label: 'Dismiss',
      onClick: () => {},
    },
  });
};

export const showAuthWarning = (message: string) => {
  toast.warning(message, {
    duration: 4000,
    position: 'top-right',
  });
};

export const showAuthInfo = (message: string) => {
  toast.info(message, {
    duration: 3000,
    position: 'top-right',
  });
};

// Specific authentication notifications
export const notifyLoginSuccess = (userName: string) => {
  const name = userName || 'User';
  showAuthSuccess(`Welcome back, ${name}!`);
};

export const notifyLoginError = (error: string) => {
  showAuthError(`Login failed: ${error}`);
};

export const notifySignupSuccess = (userName: string) => {
  const name = userName || 'User';
  showAuthSuccess(`Account created successfully! Welcome, ${name}!`);
};

export const notifySignupError = (error: string) => {
  showAuthError(`Signup failed: ${error}`);
};

export const notifyLogout = () => {
  showAuthInfo('You have been logged out successfully');
};

export const notifySessionExpired = () => {
  showAuthWarning('Your session has expired. Please login again.');
};

export const notifyAuthRequired = () => {
  showAuthWarning('Please login to access this page');
};

export const notifyNetworkError = () => {
  showAuthError('Network error. Please check your connection and try again.');
};