import { renderHook, act } from '@testing-library/react-hooks';
import { useUserManagement } from '../useUserManagement';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Mock dependencies
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } })
    }
  }
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('useUserManagement', () => {
  // Setup mock data and auth
  const mockUsers = [
    {
      id: 'user1',
      email: 'user1@example.com',
      first_name: 'John',
      last_name: 'Doe',
      status: 'active',
      subscription_status: 'premium',
      last_login_at: '2025-07-01T00:00:00Z',
      events_count: 5,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'user2',
      email: 'user2@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      status: 'suspended',
      subscription_status: 'free',
      last_login_at: null,
      events_count: 2,
      created_at: '2025-02-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      isAdmin: jest.fn().mockReturnValue(true),
      hasAdminPermission: jest.fn().mockReturnValue(true),
      getAdminUserDetails: jest.fn().mockResolvedValue({
        id: 'user1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe'
      })
    });
    
    // Mock supabase responses
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
    });
    
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });
  });

  it('should fetch users on initial load', async () => {
    // Setup mock response
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
    });

    // Render hook
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for data to load
    await waitForNextUpdate();
    
    // Check loading state and data
    expect(result.current.loading).toBe(false);
    expect(result.current.users).toHaveLength(2);
    expect(result.current.users[0].email).toBe('user1@example.com');
    expect(result.current.users[1].email).toBe('user2@example.com');
  });

  it('should handle search functionality', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    // Wait for initial load
    await waitForNextUpdate();
    
    // Perform search
    act(() => {
      result.current.searchUsers('john');
    });
    
    // Wait for search results
    await waitForNextUpdate();
    
    // Verify search was called with correct parameters
    expect(supabase.from).toHaveBeenCalledWith('admin_user_overview');
    expect(supabase.or).toHaveBeenCalledWith('email.ilike.%john%,first_name.ilike.%john%,last_name.ilike.%john%');
  });

  it('should handle user suspension', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    // Wait for initial load
    await waitForNextUpdate();
    
    // Mock RPC call for suspension
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: true, error: null });
    
    // Suspend a user
    await act(async () => {
      await result.current.suspendUser('user1', 'Violation of terms');
    });
    
    // Verify RPC was called with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith('admin_suspend_user', expect.objectContaining({
      user_uuid: 'user1',
      suspension_reason: 'Violation of terms'
    }));
  });

  it('should handle user reactivation', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    // Wait for initial load
    await waitForNextUpdate();
    
    // Mock RPC call for reactivation
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: true, error: null });
    
    // Reactivate a user
    await act(async () => {
      await result.current.reactivateUser('user2');
    });
    
    // Verify RPC was called with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith('admin_reactivate_user', expect.objectContaining({
      user_uuid: 'user2'
    }));
  });

  it('should get user details', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    // Wait for initial load
    await waitForNextUpdate();
    
    // Get user details
    const userDetails = await result.current.getUserDetails('user1');
    
    // Verify user details were fetched
    expect(userDetails).toEqual({
      id: 'user1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(useAuth().getAdminUserDetails).toHaveBeenCalledWith('user1');
  });

  it('should handle errors properly', async () => {
    // Mock auth to return not admin
    (useAuth as jest.Mock).mockReturnValue({
      isAdmin: jest.fn().mockReturnValue(false)
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    // Wait for error to be set
    await waitForNextUpdate();
    
    // Check error state
    expect(result.current.error).toBe('Unauthorized: Admin access required');
    expect(result.current.loading).toBe(false);
  });
});