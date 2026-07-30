const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('vendor_wallet').select('*').limit(1);
  console.log('vendor_wallet Error:', error);
  const { data: d2, error: e2 } = await supabase.from('vendor_wallet_transactions').select('*').limit(1);
  console.log('vendor_wallet_transactions Error:', e2);
}
check();
