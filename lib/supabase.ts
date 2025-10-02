import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only check client-side variables at module load time
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase client environment variables");
}

export const createSupabaseClient = () => {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export const createSupabaseServerClient = async () => {
  // Check server-side variables only when this function is called
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server environment variables");
  }
  // Use service role key for server operations to bypass RLS policies
  return createClient(supabaseUrl, supabaseServiceKey);
};