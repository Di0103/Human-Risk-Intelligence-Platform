import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttowsqoehnciwxcrueav.supabase.co/rest/v1/';
const supabaseAnonKey = 'sb_publishable_2yqCtDIRCaFx9HKfFgRJmQ_Xg-pqTJj';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);