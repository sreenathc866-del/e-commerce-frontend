const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, order_id, gross_amount, commission, vendor_amount, orders(status)')
    .eq('shop_id', 'fa2d0772-826b-428b-bc04-4c151d70406c');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
main();
