import { supabase } from '@/lib/supabaseClient'

export function useSupabase() {
  return {
    client: supabase,
    // Add more utility functions here as needed
  }
} 