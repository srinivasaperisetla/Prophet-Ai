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

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type PlanType =
  | "starter-pack"
  | "base-pack"
  | "value-pack"
  | "high-roller-pack"
  | "pro";

export interface CheckoutTransaction {
  plan: PlanType;
  userId: string;
}

export interface TransactionData {
  id?: string;
  user_id: string;
  plan: PlanType;
  amount: number;
  tokens: number;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  status?: "pending" | "completed" | "failed";
  created_at?: string;
}

export interface PlanConfig {
  name: string;
  amount: number; // in dollars
  tokens: number;
  isSubscription: boolean;
}
