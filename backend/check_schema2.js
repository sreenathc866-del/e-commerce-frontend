const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('order_items').select('*').limit(1);
  if (data && data.length) console.log(Object.keys(data[0]));
  else console.log('No order items or error:', error);
}
check();
