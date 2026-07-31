const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const shopId = "fa2d0772-826b-428b-bc04-4c151d70406c";
  const { data: orderItems, error } = await supabase
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
    console.error(error);
    return;
  }

  const groupedOrders = new Map();
  
  if (orderItems) {
    orderItems.forEach((item) => {
      const orderData = Array.isArray(item.orders) ? item.orders[0] : item.orders;
      if (!orderData || orderData.status === 'pending') {
        console.log(`Skipping pending/null order: ${orderData?.id} (status: ${orderData?.status})`);
        return;
      }
      const orderId = orderData.id;
      
      if (!groupedOrders.has(orderId)) {
        const customerData = Array.isArray(orderData.profiles) ? orderData.profiles[0] : orderData.profiles;
        const addressData = Array.isArray(orderData.addresses) ? orderData.addresses[0] : orderData.addresses;
        
        const addressStr = addressData 
          ? `${addressData.address_line1}, ${addressData.city}, ${addressData.state} ${addressData.zip_code}` 
          : 'No address provided';

        const txData = Array.isArray(orderData.transactions) ? orderData.transactions[0] : orderData.transactions;

        groupedOrders.set(orderId, {
          id: orderId,
          customer: customerData?.full_name || 'Unknown Customer',
          date: orderData.created_at,
          total: 0,
          status: orderData.status,
          items: [],
          address: addressStr,
          paymentId: txData?.payment_id || null
        });
      }

      const currentOrder = groupedOrders.get(orderId);
      const productData = Array.isArray(item.products) ? item.products[0] : item.products;
      
      currentOrder.items.push({
        name: productData?.title || 'Unknown Product',
        qty: item.quantity,
        price: item.unit_price
      });
      
      currentOrder.total += (item.quantity * item.unit_price);
    });
  }

  const finalOrders = Array.from(groupedOrders.values());
  console.log("Final orders grouped count:", finalOrders.length);
  console.log("Final orders:", JSON.stringify(finalOrders, null, 2));
}
main();
