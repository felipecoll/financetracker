import { createClient } from '@supabase/supabase-js';

// Reemplazá esto con las credenciales que te da Supabase en Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey);