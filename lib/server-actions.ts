'use server';

import { auth } from '@clerk/nextjs/server';
import { 
  getUserByClerkId, 
  getUserWithTokenLedger, 
  deleteUser, 
  syncUserWithClerk,
  deleteAndRecreateApiKey 
} from './actions';

// ============================================================================
// USER SERVER ACTIONS
// ============================================================================

export async function getUserData() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await getUserWithTokenLedger(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteUserAccount() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await deleteUser(userId);
    
    return {
      success: true,
      message: 'User account deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function syncUser() {
  try {
    const user = await syncUserWithClerk();
    
    return {
      success: true,
      message: 'User synced successfully',
      user: user
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// API KEY SERVER ACTIONS
// ============================================================================

export async function regenerateUserApiKey(userId: string) {
  try {
    const newApiKey = await deleteAndRecreateApiKey(userId);
    return {
      success: true,
      apiKey: newApiKey
    };
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
