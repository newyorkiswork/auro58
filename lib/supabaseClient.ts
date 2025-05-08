import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Supabase Environment Check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase client with debug options
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log client configuration
console.log('Supabase Client Configuration:');
console.log('- URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('- Key Present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('- Client Initialized:', !!supabase);