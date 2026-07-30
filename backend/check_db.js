const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  console.log('Transactions table:', error || 'exists, rows: ' + data.length);
  
  const { data: d2, error: e2 } = await supabase.from('payment_logs').select('*').limit(1);
  console.log('Payment_logs table:', e2 || 'exists, rows: ' + d2.length);

  const { data: d3, error: e3 } = await supabase.from('order_items').select('id, shop_id').limit(1);
  console.log('order_items shop_id:', e3 || 'exists');
}
check();
