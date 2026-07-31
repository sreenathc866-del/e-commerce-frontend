const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const shopId = "af23e04a-722b-46bd-b4b8-74a2f552a6a8"; // dummy or any shop
  console.log("Fetching order items...");
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
    .limit(1);

  if (error) {
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
  } else {
    console.log("Success! Data:", JSON.stringify(data, null, 2));
  }
}
main();
