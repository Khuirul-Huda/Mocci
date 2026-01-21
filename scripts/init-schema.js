#!/usr/bin/env node

/**
 * Standalone script to initialize Supabase schema
 * Usage: node scripts/init-schema.js
 * or: npm run init-schema
 */

const { initializeSchema, checkTablesExist } = require('../utils/schema-init');

async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        Mocci Bot - Database Schema Initializer        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    try {
        // Check current state
        const { exists, missing } = await checkTablesExist();
        
        if (exists) {
            console.log('✅ All required tables already exist!');
            console.log('📊 Your database is ready to use.\n');
            return;
        }
        
        console.log(`⚠️  Missing ${missing.length} table(s):`, missing.join(', '));
        console.log('');
        
        // Attempt initialization
        const success = await initializeSchema();
        
        if (success) {
            console.log('\n✅ Schema initialization completed successfully!');
            console.log('🚀 You can now start the bot.\n');
        } else {
            console.log('\n⚠️  Automatic setup not available.');
            console.log('📝 Please follow the manual setup instructions above.\n');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Error during schema initialization:', error.message);
        console.error('\nPlease check your Supabase credentials in .env file:\n');
        console.error('  SUPABASE_URL=your_supabase_url');
        console.error('  SUPABASE_KEY=your_supabase_key\n');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
