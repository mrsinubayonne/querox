
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aufmphldtjrcddyayqoy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Zm1waGxkdGpyY2RkeWF5cW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzMwNTUsImV4cCI6MjA2NTI0OTA1NX0.MJm2BxWo43HLFpVLFsI2nw4KeFbRNJxm2O7G8L0po_Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})
