const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const email = `test_customer_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  console.log(`1. Creating test customer: ${email}`);
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'customer', full_name: 'Test Customer' }
  });

  if (authError) {
    console.error('Failed to create user:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log(`User created with ID: ${userId}`);

  try {
    // Let's find a product and shop to create an order item
    const { data: products } = await supabaseAdmin.from('products').select('id, price, shop_id').limit(1);
    if (!products || products.length === 0) {
      console.log('No products found in DB to place test order.');
      return;
    }
    const product = products[0];

    // Create an address first
    const { data: address, error: addrError } = await supabaseAdmin.from('addresses').insert({
      user_id: userId,
      full_name: 'Test Customer',
      mobile: '1234567890',
      address_line1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip_code: '12345'
    }).select().single();

    if (addrError) {
      console.error('Failed to create address:', addrError);
      return;
    }

    // Insert order (admin bypasses RLS)
    console.log('2. Inserting test order (admin)...');
    const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
      customer_id: userId,
      shipping_address_id: address.id,
      total_amount: product.price,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'razorpay'
    }).select().single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return;
    }

    // Insert order item
    console.log('3. Inserting test order item (admin)...');
    const { error: itemError } = await supabaseAdmin.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      shop_id: product.shop_id,
      quantity: 1,
      unit_price: product.price,
      gross_amount: product.price,
      commission: 0,
      vendor_amount: product.price
    });

    if (itemError) {
      console.error('Failed to create order item:', itemError);
      return;
    }

    // Now sign in as the user
    console.log('4. Signing in as user...');
    const userClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Failed to sign in:', signInError);
      return;
    }

    console.log('5. Querying orders and order_items as user...');
    const { data: userOrders, error: userOrdersError } = await userClient
      .from('orders')
      .select(`
        id, total_amount, status, payment_status, created_at,
        order_items (
          id, quantity, unit_price,
          products ( title )
        )
      `)
      .eq('customer_id', userId);

    console.log('User Client Query Error:', userOrdersError);
    console.log('User Client Query Data:', JSON.stringify(userOrders, null, 2));

  } finally {
    // Cleanup
    console.log('6. Cleaning up test user...');
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log('Done.');
  }
}

main();
