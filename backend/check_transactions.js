const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('transactions').insert({
    order_id: '123e4567-e89b-12d3-a456-426614174000', // random uuid
    payment_id: 'pay_123',
    amount: 10,
    status: 'success'
  });
  console.log('Insert Error:', error);
}
check();
