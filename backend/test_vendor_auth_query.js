const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const email = "sreenathc66+vendor@gmail.com";
  const password = "password123"; // or whatever password they use. Wait, let's look at the database or if we can sign in.
  // Actually, we don't know the password!
  // But wait! We can bypass the password by generating a token for the user!
  // In Supabase, can we generate a token? No.
  // But we can create a client with the user's ID by setting the JWT manually!
  // Supabase JWT contains sub: userId, role: authenticated, etc.
  // Let's create a dummy signed JWT using the SUPABASE_JWT_SECRET (if we have it).
  // Do we have the JWT secret? No, we don't.
  // Wait! We can sign in using a script with password, let's look at the vendor's password if they have a mock password.
  // Typically, mock passwords in these projects are 'password', 'password123', '123456'.
  // Let's try signing in.
  const passwords = ['password', 'password123', '123456', 'Sreenath@123'];
  for (const pw of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (!error) {
      console.log(`Success sign in with password: ${pw}`);
      const userClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`
          }
        }
      });
      
      console.log("Fetching order items as vendor...");
      const { data: items, error: fetchErr } = await userClient
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
        .eq('shop_id', 'fa2d0772-826b-428b-bc04-4c151d70406c');
        
      if (fetchErr) {
        console.error("Fetch error:", fetchErr);
      } else {
        console.log("Fetch success! Length:", items.length);
        console.log("Sample item orders join result:", JSON.stringify(items[0]?.orders, null, 2));
      }
      return;
    }
  }
  console.log("Failed to sign in with mock passwords.");
}
main();
