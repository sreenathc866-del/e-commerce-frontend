const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Fetching shops...");
  const { data: shops, error } = await supabase
    .from('shops')
    .select('id, name, vendor_id');
  if (error) console.error(error);
  else console.log("Shops:", JSON.stringify(shops, null, 2));

  console.log("Fetching order_items...");
  const { data: items, error: err } = await supabase
    .from('order_items')
    .select('id, shop_id, order_id, gross_amount, unit_price, quantity')
    .limit(20);
  if (err) console.error(err);
  else console.log("Order Items:", JSON.stringify(items, null, 2));
}
main();
