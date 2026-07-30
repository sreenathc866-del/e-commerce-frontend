const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Fetch the 5 most recent orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, created_at, status, payment_status, total_amount, razorpay_order_id, razorpay_payment_id')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  console.log('Recent Orders:', JSON.stringify(orders, null, 2));
}
check();
