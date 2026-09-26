import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { performance } from 'perf_hooks';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);
const adminSupabase = serviceKey ? createClient(supabaseUrl, serviceKey) : null;

async function timeOperation(name, fn) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { name, duration: Math.round(duration * 100) / 100, result };
}

async function runBenchmark() {
  console.log('=== RUNNING PERFORMANCE BENCHMARK ===\n');

  // 1. Direct Supabase Query: Active Listings (Homepage / Marketplace query)
  const q1 = await timeOperation('Query: Active Listings (limit 60)', async () => {
    return await supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, description, category, seller_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(60);
  });
  console.log(`[1] ${q1.name}: ${q1.duration}ms (Rows: ${q1.result.data?.length || 0})`);

  // 2. Query: Business Pages Table
  if (adminSupabase) {
    const q2 = await timeOperation('Query: Business Pages table', async () => {
      return await adminSupabase
        .from('business_pages')
        .select('*')
        .order('created_at', { ascending: true });
    });
    console.log(`[2] ${q2.name}: ${q2.duration}ms (Rows: ${q2.result.data?.length || 0})`);
  }

  // 3. Query: Profiles for Sellers
  const sellerIds = (q1.result.data || []).map(l => l.seller_id).filter(Boolean);
  const uniqueSellerIds = [...new Set(sellerIds)];
  const q3 = await timeOperation(`Query: Profiles in batch (${uniqueSellerIds.length} unique sellers)`, async () => {
    return await supabase
      .from('profiles')
      .select('id, username, account_type, is_verified, is_staff, role, email')
      .in('id', uniqueSellerIds);
  });
  console.log(`[3] ${q3.name}: ${q3.duration}ms (Found: ${q3.result.data?.length || 0})`);

  // 4. Test Single Listing Fetch + Reviews + Profile
  if (q1.result.data && q1.result.data.length > 0) {
    const sampleListing = q1.result.data[0];
    const q4 = await timeOperation('Query: Single Listing + Seller Profile + Reviews (Parallel)', async () => {
      return await Promise.all([
        supabase.from('listings').select('*').eq('id', sampleListing.id).single(),
        supabase.from('profiles').select('id, username, account_type, updated_at, avatar_url').eq('id', sampleListing.seller_id).maybeSingle(),
        supabase.from('reviews').select('rating').eq('reviewee_id', sampleListing.seller_id)
      ]);
    });
    console.log(`[4] ${q4.name}: ${q4.duration}ms`);
  }

  // 5. Test Multiple Runs Average for Listings
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const t = await timeOperation(`Run ${i+1}`, async () => {
      return await supabase
        .from('listings')
        .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, description, category, seller_id')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(60);
    });
    runs.push(t.duration);
  }
  const avg = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);
  console.log(`[5] 5-Run Average Active Listings: ${avg}ms (Runs: ${runs.join(', ')}ms)`);

  // 6. Test seller metadata lookup with fallback getUserById
  const testSellerIds = uniqueSellerIds.length > 0 ? uniqueSellerIds : ['00000000-0000-0000-0000-000000000000'];
  const q6 = await timeOperation(`Admin getUserById test (${testSellerIds[0]})`, async () => {
    if (!adminSupabase) return null;
    try {
      return await adminSupabase.auth.admin.getUserById(testSellerIds[0]);
    } catch (e) {
      return null;
    }
  });
  console.log(`[6] ${q6.name}: ${q6.duration}ms`);

  // 7. Sequential vs Parallel Execution for 3 Sellers (Simulating previous N+1 vs current parallel)
  const dummyIds = [testSellerIds[0], testSellerIds[0], testSellerIds[0]];
  const q7Seq = await timeOperation('Previous: 3x Sequential getUserById', async () => {
    if (!adminSupabase) return [];
    const res = [];
    for (const id of dummyIds) {
      try {
        const u = await adminSupabase.auth.admin.getUserById(id);
        res.push(u);
      } catch (e) {}
    }
    return res;
  });
  console.log(`[7A] ${q7Seq.name}: ${q7Seq.duration}ms`);

  const q7Par = await timeOperation('Optimized: 3x Parallel Promise.all getUserById', async () => {
    if (!adminSupabase) return [];
    return await Promise.all(dummyIds.map(id => adminSupabase.auth.admin.getUserById(id).catch(() => null)));
  });
  console.log(`[7B] ${q7Par.name}: ${q7Par.duration}ms`);

  // 8. In-Memory Cache Lookup Speed
  const localCache = new Map();
  localCache.set('test-user-id', { username: 'Verified Seller', is_verified: true, expiresAt: Date.now() + 600000 });
  const q8 = await timeOperation('Optimized: In-Memory Cached Seller Lookup', async () => {
    return localCache.get('test-user-id');
  });
  console.log(`[8] ${q8.name}: ${q8.duration}ms`);

  console.log('\n=== BENCHMARK COMPLETE ===');
}

runBenchmark().catch(console.error);


