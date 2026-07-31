const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const customerId = "8a2e7f97-7b5a-4a36-81fc-51635f34b9e4";
  console.log("Fetching customer orders with ANON key...");
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, total_amount, status, payment_status, created_at,
      order_items (
        id, quantity, unit_price,
        products ( title )
      )
    `)
    .eq('customer_id', customerId);

  if (error) {
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
  } else {
    console.log("Success! Data length:", data?.length);
    console.log("Data sample:", JSON.stringify(data, null, 2));
  }
}
main();
