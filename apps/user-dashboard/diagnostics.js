// Supabase Connection Diagnostic
console.log('🔍 Supabase Connection Diagnostics');
console.log('================================');

console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50) + '...');

// Test WebSocket connection
const wsUrl = `ws://localhost:54321/realtime/v1/websocket?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}&vsn=1.0.0`;
console.log('\nTesting WebSocket connection...');
console.log('WebSocket URL:', wsUrl.substring(0, 100) + '...');

// Simple test
import { createClient } from '../src/lib/supabase/client';

const supabase = createClient();

console.log('\nTesting Supabase client...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Auth session error:', error);
  } else {
    console.log('✅ Auth session successful');
  }
});

// Test realtime connection
const channel = supabase.channel('test-channel');
channel.subscribe((status) => {
  console.log('Realtime connection status:', status);
});

export {};
