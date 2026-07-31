const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('transactions').insert({
    order_id: 'a1ec1efc-4a4b-4a3a-baf4-cb3f771c901b', // a valid order
    payment_id: 'pay_test_' + Date.now(),
    amount: 1,
    status: 'success'
  }).select();
  
  console.log('Error:', error);
  console.log('Data:', data);
}
check();
