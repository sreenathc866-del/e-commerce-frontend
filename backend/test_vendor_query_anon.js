const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const shopId = "fa2d0772-826b-428b-bc04-4c151d70406c";
  console.log("Fetching order items with ANON key...");
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      quantity,
      unit_price,
      product_id,
      products ( title ),
      order_id,
      orders (
        id,
        status,
        created_at,
        profiles ( full_name ),
        addresses ( address_line1, city, state, zip_code ),
        transactions ( payment_id )
      )
    `)
    .eq('shop_id', shopId);

  if (error) {
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
  } else {
    console.log("Success! Data length:", data?.length);
    console.log("Data sample:", JSON.stringify(data?.[0], null, 2));
  }
}
main();
