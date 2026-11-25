
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wanorutalcikroxpzzhx.supabase.co'

const SUPABASE_ANON_KEY = 'sb_publishable_1JO_WOgqJ40wcSngPO0uTA_7uk4AGJo'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
