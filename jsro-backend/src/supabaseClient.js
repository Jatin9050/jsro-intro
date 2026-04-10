import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djezyrrnmqqhopamttkb.supabase.co';     // ← Replace
const supabaseAnonKey = 'sb_publishable_DbgXDjtunz3CeFT2MLTKvQ_EDGFaaeW';                 // ← Replace

export const supabase = createClient(supabaseUrl, supabaseAnonKey);