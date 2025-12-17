
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  // Try common places for injected variables
  const val = (window as any).process?.env?.[key] || 
              (import.meta as any).env?.[key] || 
              (window as any)[key];
              
  return val;
};

// Use provided credentials as defaults to ensure the app works immediately on deployment
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://ujjvaabarnbvfntvvlsp.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqanZhYWJhcm5idmZudHZ2bHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTU0ODMsImV4cCI6MjA4MTU3MTQ4M30.zSdrxkVQWvgABbanv59l1ursAx6s9JrsTT0KlKKRtU4';

let supabaseClient: any;

try {
  if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  console.error("Critical: Supabase initialization failed", err);
}

// Fallback mock client if initialization fails to prevent the app from hard-crashing
if (!supabaseClient) {
  supabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.reject(new Error("Database connection not established")),
      signUp: () => Promise.reject(new Error("Database connection not established")),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: null }), 
          order: () => Promise.resolve({ data: [], error: null }) 
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      upsert: () => Promise.resolve({ error: null }),
      insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error("Storage not configured")),
        getPublicUrl: () => ({ data: { publicUrl: "" } })
      })
    },
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }), subscribe: () => ({ unsubscribe: () => {} }) })
  };
}

export const supabase = supabaseClient;
