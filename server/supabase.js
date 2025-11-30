// backend/supabase.js
import { createClient } from '@supabase/supabase-js';

// Use environment variables (set these in Render or Vercel as described below)
const SUPABASE_URL = process.env.SUPABASE_URL;          // e.g. https://pdpqxjgvjofiuvjcraoh.supabase.co
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// Create admin-like client on server (service key if you need server privileges).
// WARNING: never expose a service_role key to the browser.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
