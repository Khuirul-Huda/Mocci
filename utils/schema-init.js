const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Required tables for the bot to function
const REQUIRED_TABLES = [
    'snippets',
    'leetcode_cache',
    'ai_channels',
    'ai_memory',
    'user_preferences',
    'user_levels',
    'warnings',
    'server_logs',
    'starboard',
    'giveaways',
    'welcome_config',
    'afk_status'
];

/**
 * Check if all required tables exist in the database
 * @returns {Promise<{exists: boolean, missing: string[]}>}
 */
async function checkTablesExist() {
    try {
        const missingTables = [];
        
        for (const table of REQUIRED_TABLES) {
            const { data, error } = await supabase
                .from(table)
                .select('id')
                .limit(1);
            
            // If error code is 42P01, table doesn't exist
            if (error && error.code === '42P01') {
                missingTables.push(table);
            }
        }
        
        return {
            exists: missingTables.length === 0,
            missing: missingTables
        };
    } catch (error) {
        console.error('Error checking tables:', error);
        return { exists: false, missing: REQUIRED_TABLES };
    }
}

/**
 * Execute SQL schema from file
 * @returns {Promise<boolean>}
 */
async function executeSchema() {
    try {
        const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            console.error('Schema file not found at:', schemaPath);
            return false;
        }
        
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('🔄 Attempting to execute schema automatically...');
        
        // Try to execute using Supabase REST API directly
        try {
            const response = await fetch(`${supabaseUrl.replace('/rest/v1', '')}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ query: schema })
            });
            
            if (response.ok || response.status === 409) {
                console.log('✅ Schema executed successfully via API!');
                return true;
            }
        } catch (apiError) {
            // API execution failed, continue to manual approach
        }
        
        // If API execution fails, guide user to manual setup
        console.log('⚠️  Automatic execution not available (requires admin API access)');
        return false;
        
    } catch (error) {
        console.error('❌ Error executing schema:', error);
        return false;
    }
}

/**
 * Initialize database schema if needed
 * @returns {Promise<boolean>}
 */
async function initializeSchema() {
    try {
        console.log('🔍 Checking database schema...');
        
        const { exists, missing } = await checkTablesExist();
        
        if (exists) {
            console.log('✅ All required tables exist');
            return true;
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log('❌ CRITICAL: DATABASE TABLES MISSING!');
        console.log('═'.repeat(70));
        console.log('\n⚠️  Missing tables:', missing.join(', '));
        console.log('\n� THE BOT CANNOT FUNCTION WITHOUT THESE TABLES!\n');
        console.log('📋 YOU MUST CREATE TABLES MANUALLY:\n');
        console.log('1️⃣  Open your Supabase Dashboard');
        console.log('2️⃣  Go to SQL Editor (left sidebar)');
        console.log('3️⃣  Click "New query"');
        console.log('4️⃣  Copy ALL contents from: supabase-schema.sql');
        console.log('5️⃣  Paste into SQL Editor and click "Run"');
        console.log('6️⃣  Wait for "Success. No rows returned"');
        console.log('7️⃣  Restart the bot\n');
        console.log('Dashboard URL: ' + supabaseUrl.replace('/rest/v1', ''));
        console.log('\n' + '═'.repeat(70));
        console.log('⏸️  Bot will start but features will NOT work until tables are created!');
        console.log('═'.repeat(70) + '\n');
        
        // Give user time to read the message
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        return false;
        
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        console.log('\n⚠️  Cannot verify database schema. Please check:');
        console.log('   - SUPABASE_URL in .env file');
        console.log('   - SUPABASE_KEY in .env file');
        console.log('   - Internet connection\n');
        return false;
    }
}

module.exports = {
    initializeSchema,
    checkTablesExist,
    executeSchema
};
