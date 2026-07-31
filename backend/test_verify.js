const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  try {
    const orderId = "a1ec1efc-4a4b-4a3a-baf4-cb3f771c901b";
    
    console.log("Updating order...");
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        razorpay_payment_id: "pay_test123"
      })
      .eq('id', orderId)
      .select()
      .single();
      
    console.log("Update result:", updatedOrder, updateError);
    
    if (updateError || !updatedOrder) throw new Error("Update failed");

    console.log("Fetching order items...");
    const { data: orderItems, error: fetchItemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id, 
        gross_amount, 
        commission, 
        vendor_amount,
        shops ( vendor_id )
      `)
      .eq('order_id', updatedOrder.id);
      
    console.log("Order items result:", orderItems, fetchItemsError);

    console.log("Inserting transaction...");
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        order_id: updatedOrder.id,
        payment_id: "pay_test123",
        amount: updatedOrder.total_amount,
        status: 'success'
      });
      
    console.log("Transaction result:", tx, txError);
  } catch (e) {
    console.error("Exception caught:", e);
  }
}
main();
