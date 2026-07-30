import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env');
  process.exit(1);
}

// Initialize Supabase Client with Service Role Key (bypasses RLS for admin actions)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const buckets = [
  'shop-logos',
  'shop-banners',
  'product-images',
  'product-3d-models',
  'invoices',
  'review-images'
];

async function createStorageBuckets() {
  console.log('Initializing Supabase storage buckets...');

  for (const bucketName of buckets) {
    try {
      // Check if bucket already exists
      const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName);

      if (getError && getError.message.includes('not found')) {
        console.log(`Bucket "${bucketName}" not found. Creating...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        });

        if (createError) {
          console.error(`Failed to create bucket "${bucketName}":`, createError.message);
        } else {
          console.log(`Successfully created public bucket: "${bucketName}"`);
        }
      } else if (getError) {
        console.error(`Error checking bucket "${bucketName}":`, getError.message);
      } else {
        console.log(`Bucket "${bucketName}" already exists. Ensuring it is public...`);
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
          public: true
        });
        if (updateError) {
          console.error(`Failed to update bucket "${bucketName}" to public:`, updateError.message);
        } else {
          console.log(`Bucket "${bucketName}" is now confirmed public.`);
        }
      }
    } catch (err: any) {
      console.error(`Unexpected error for bucket "${bucketName}":`, err.message || err);
    }
  }

  console.log('\nAll storage buckets processed successfully!');
}

createStorageBuckets();
