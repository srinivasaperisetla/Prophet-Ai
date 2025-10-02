-- USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    billing_model TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- API KEYS TABLE
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    hashed_key TEXT NOT NULL,
    encrypted_key TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TOKEN LEDGER TABLE
CREATE TABLE token_ledger (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available INT DEFAULT 0,
    used INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- API REQUESTS TABLE
CREATE TABLE api_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- STRIPE EVENTS TABLE
CREATE TABLE stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    raw_event JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY; 