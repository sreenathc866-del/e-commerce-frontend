const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\e-commerce\\backend\\.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'confirmed', 
      payment_status: 'paid' 
    })
    .eq('id', 'a1ec1efc-4a4b-4a3a-baf4-cb3f771c901b') // the recent order
    .select();
  
  console.log('Update Error:', error);
  console.log('Update Data:', data);
}
check();
