// Quick test to verify Supabase tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkTables() {
    const tables = ['user_levels', 'afk_status', 'ai_channels', 'snippets', 'warnings'];
    
    console.log('🔍 Testing table access...\n');
    
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`❌ ${table}: ${error.message} (Code: ${error.code})`);
            } else {
                console.log(`✅ ${table}: Accessible (${count || 0} rows)`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }
}

checkTables();
