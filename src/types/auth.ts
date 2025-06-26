export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy?: string;
  assignedAt: string;
  expiresAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUserData: () => Promise<void>;
}