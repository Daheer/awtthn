import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvwskhpdjuecpokklpwb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2d3NraHBkanVlY3Bva2tscHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MzY4MjYsImV4cCI6MjA0NjQxMjgyNn0.ttkD1Cy15ncmX-GRtjInMFuUEjqU0oBWvk9u_XWIKqA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function verifyPin(voterId, pin) {
  const { data, error } = await supabase
    .from('voters')
    .select('pin')
    .eq('id', voterId)
    .maybeSingle();

  if (error) {
    throw new Error('Error verifying pin: ' + error.message);
  }

  return data && data.pin === pin;
}
