/**
 * User validation utilities for admin user management
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate user data for creation or update
 */
export const validateUserData = (userData: {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate email if provided
  if (userData.email !== undefined) {
    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(userData.email)) {
      errors.email = 'Invalid email format';
    }
  }
  
  // Validate first name if provided
  if (userData.firstName !== undefined && !userData.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  
  // Validate last name if provided
  if (userData.lastName !== undefined && !userData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  // Validate status if provided
  if (userData.status !== undefined) {
    const validStatuses = ['active', 'suspended', 'pending'];
    if (!validStatuses.includes(userData.status)) {
      errors.status = 'Invalid status value';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate suspension reason
 */
export const validateSuspensionReason = (reason: string): { isValid: boolean; error?: string } => {
  if (!reason.trim()) {
    return { isValid: false, error: 'Suspension reason is required' };
  }
  
  if (reason.length < 10) {
    return { isValid: false, error: 'Suspension reason must be at least 10 characters' };
  }
  
  if (reason.length > 500) {
    return { isValid: false, error: 'Suspension reason must be less than 500 characters' };
  }
  
  return { isValid: true };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join(', ');
};

/**
 * Map API error messages to user-friendly messages
 */
export const mapErrorMessage = (error: string): string => {
  // Map common error messages to user-friendly versions
  const errorMap: Record<string, string> = {
    'duplicate key value violates unique constraint': 'A user with this email already exists',
    'new row for relation "users" violates check constraint': 'Invalid user data provided',
    'permission denied for table': 'You do not have permission to perform this action',
    'JWTExpired': 'Your session has expired. Please log in again',
    'JWTInvalid': 'Authentication error. Please log in again'
  };
  
  // Check if the error message contains any of the keys
  for (const [key, message] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return message;
    }
  }
  
  // Default error message
  return error;
};

/**
 * Check if user has required permissions for an action
 */
export const checkPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for wildcard permissions (e.g., "users:*" grants all user permissions)
  const resourceType = requiredPermission.split(':')[0];
  if (userPermissions.includes(`${resourceType}:*`)) {
    return true;
  }
  
  // Super admin has all permissions
  if (userPermissions.includes('*:*')) {
    return true;
  }
  
  return false;
};