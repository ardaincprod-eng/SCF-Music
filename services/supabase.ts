
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  // Vercel veya yerel ortam değişkenlerini kontrol et
  const val = (window as any).process?.env?.[key] || 
              (import.meta as any).env?.[key] || 
              (window as any)[key];
              
  return val;
};

// Sağladığınız bilgiler varsayılan (fallback) olarak eklendi
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://ujjvaabarnbvfntvvlsp.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqanZhYWJhcm5idmZudHZ2bHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTU0ODMsImV4cCI6MjA4MTU3MTQ4M30.zSdrxkVQWvgABbanv59l1ursAx6s9JrsTT0KlKKRtU4';

console.log("SCF Music: Supabase bağlantısı kuruluyor...");

let supabaseClient: any;

try {
  if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log("SCF Music: Supabase bağlantısı başarılı.");
  }
} catch (err) {
  console.error("Kritik Hata: Supabase başlatılamadı", err);
}

// Supabase kapalıysa veya hata varsa uygulamanın çökmesini önleyen mock objesi
if (!supabaseClient) {
  supabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.reject(new Error("Veritabanı bağlantısı yok.")),
      signUp: () => Promise.reject(new Error("Veritabanı bağlantısı yok.")),
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
        upload: () => Promise.reject(new Error("Depolama alanı erişilebilir değil.")),
        getPublicUrl: () => ({ data: { publicUrl: "" } })
      })
    },
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }), subscribe: () => ({ unsubscribe: () => {} }) })
  };
}

export const supabase = supabaseClient;
