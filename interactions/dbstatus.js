const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTablesExist } = require('../utils/schema-init');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dbstatus')
        .setDescription('Check database connection and table status'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🗄️ Database Status')
            .setColor(0x3498db)
            .setTimestamp();
        
        try {
            // Check table existence
            const { exists, missing } = await checkTablesExist();
            
            if (exists) {
                embed.setDescription('✅ **All systems operational**');
                embed.setColor(0x2ecc71);
                embed.addFields(
                    { name: '📊 Tables', value: '✅ All required tables exist', inline: true },
                    { name: '🔗 Connection', value: '✅ Connected to Supabase', inline: true }
                );
            } else {
                embed.setDescription('⚠️ **Setup required**');
                embed.setColor(0xe74c3c);
                embed.addFields(
                    { name: '❌ Missing Tables', value: missing.join(', '), inline: false },
                    { name: '📝 Action Required', value: 'Run `npm run init-schema` or check setup instructions', inline: false }
                );
            }
            
            // Test database with a simple query
            try {
                const testSnippet = await DB.listSnippets(interaction.user.id);
                embed.addFields({
                    name: '🧪 Query Test',
                    value: '✅ Database queries working',
                    inline: true
                });
            } catch (queryError) {
                embed.addFields({
                    name: '🧪 Query Test',
                    value: `❌ ${queryError.message}`,
                    inline: true
                });
            }
            
            // Add footer with database info
            embed.setFooter({ 
                text: 'Database: Supabase (PostgreSQL) | Mocci v3.0'
            });
            
        } catch (error) {
            embed.setDescription('❌ **Database connection failed**');
            embed.setColor(0xe74c3c);
            embed.addFields({
                name: 'Error',
                value: `\`\`\`${error.message}\`\`\``,
                inline: false
            });
            embed.addFields({
                name: '🔧 Troubleshooting',
                value: '1. Check your .env file\n2. Verify SUPABASE_URL and SUPABASE_KEY\n3. Ensure Supabase project is active',
                inline: false
            });
        }
        
        await interaction.editReply({ embeds: [embed] });
    }
};
