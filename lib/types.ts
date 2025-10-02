// ============================================================================
// CENTRALIZED TYPE DEFINITIONS
// ============================================================================

export interface UserData {
  id: string;
  email: string;
  stripe_customer_id?: string;
  billing_model?: "pay-per-token" | "pro";
  created_at?: string;
}

export interface TokenLedgerData {
  user_id: string;
  available: number;
  used: number;
  updated_at?: string;
}

export interface ApiKeyData {
  id: string;
  user_id: string;
  hashed_key: string;
  encrypted_key: string;
  created_at?: string;
}

// Extended interfaces for specific use cases
export interface ApiKeyDisplayData {
  id: string;
  rawKey: string | null;
  created_at: string;
}

export interface TokenDisplayData {
  available: number;
  used: number;
  billing_model: string;
}

// Component Props Interfaces
export interface ApiKeyDisplayProps {
  apiKey: ApiKeyDisplayData | null;
  userId: string;
}

export interface DashBoardNavBarClientProps {
  tokenData: TokenDisplayData | null;
}

export interface SettingsClientProps {
  userData: UserData | null;
}

export interface DashboardLayoutClientProps {
  children: React.ReactNode;
}
