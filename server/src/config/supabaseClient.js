import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase client for Tour and Vehicle operations
const SUPABASE_URL_TOUR = process.env.SUPABASE_URL_TOUR || SUPABASE_URL;
const SUPABASE_ANON_KEY_TOUR = process.env.SUPABASE_ANON_KEY_TOUR || SUPABASE_ANON_KEY;

export const supabaseTour = createClient(SUPABASE_URL_TOUR, SUPABASE_ANON_KEY_TOUR);

export default supabase;