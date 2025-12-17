
import { createClient } from '@supabase/supabase-js';

// Helper to safely get env vars without crashing if 'process' is undefined in browser
const getEnv = (key: string): string | undefined => {
  try {
    // Check various common injection points for environment variables
    return (window as any).process?.env?.[key] || (import.meta as any).env?.[key] || undefined;
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'placeholder-key';

// Only attempt to create the client if we have a valid-looking URL to avoid throwing
// 'Invalid supabaseUrl' during initialization.
let supabaseClient: any;
try {
    if (supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('placeholder')) {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        console.warn("Supabase URL is missing or placeholder. UI will load but DB features will be limited.");
        // Fallback mock client to prevent null pointer errors in the app
        supabaseClient = {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                signInWithPassword: () => Promise.reject(new Error("Database not configured")),
                signUp: () => Promise.reject(new Error("Database not configured")),
                signOut: () => Promise.resolve({ error: null })
            },
            from: () => ({
                select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) }),
                upsert: () => Promise.resolve({ error: null }),
                insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) })
            }),
            storage: {
                from: () => ({
                    upload: () => Promise.reject(new Error("Database not configured")),
                    getPublicUrl: () => ({ data: { publicUrl: "" } })
                })
            },
            channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }), subscribe: () => ({ unsubscribe: () => {} }) })
        };
    }
} catch (e) {
    console.error("Critical error during Supabase initialization:", e);
}

export const supabase = supabaseClient;
