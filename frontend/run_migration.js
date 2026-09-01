const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf-8');
const env = {};
dotenv.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

const sql = fs.readFileSync('messaging_migration.sql', 'utf-8');

async function run() {
  // Use Supabase Management API to run SQL
  const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/rpc/';
  
  // Try the SQL endpoint directly via fetch
  const pgUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '');
  const projectRef = pgUrl.split('.')[0];
  
  // Use the pg endpoint
  const response = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    console.log('Direct SQL failed:', response.status, text);
    console.log('\n========================================');
    console.log('Please run the SQL manually in Supabase Dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Paste the contents of messaging_migration.sql');
    console.log('5. Click Run');
    console.log('========================================');
  } else {
    const data = await response.json();
    console.log('Migration completed!', data);
  }
}

run();
