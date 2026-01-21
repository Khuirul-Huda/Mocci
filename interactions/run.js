const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Popular language mappings
const LANGUAGES = {
    'js': 'javascript',
    'javascript': 'javascript',
    'py': 'python',
    'python': 'python',
    'java': 'java',
    'cpp': 'c++',
    'c++': 'c++',
    'c': 'c',
    'cs': 'csharp',
    'csharp': 'csharp',
    'go': 'go',
    'rust': 'rust',
    'php': 'php',
    'ruby': 'ruby',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'ts': 'typescript',
    'typescript': 'typescript'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('run')
        .setDescription('Execute code in various programming languages')
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Programming language')
                .setRequired(true)
                .addChoices(
                    { name: 'JavaScript', value: 'javascript' },
                    { name: 'Python', value: 'python' },
                    { name: 'Java', value: 'java' },
                    { name: 'C++', value: 'c++' },
                    { name: 'C', value: 'c' },
                    { name: 'C#', value: 'csharp' },
                    { name: 'Go', value: 'go' },
                    { name: 'Rust', value: 'rust' },
                    { name: 'PHP', value: 'php' },
                    { name: 'Ruby', value: 'ruby' },
                    { name: 'TypeScript', value: 'typescript' }
                )
        )
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code to execute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('stdin')
                .setDescription('Standard input (optional)')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const language = interaction.options.getString('language');
            const code = interaction.options.getString('code');
            const stdin = interaction.options.getString('stdin') || '';

            // Execute code using Piston API
            const response = await fetch(`${PISTON_API}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    language: language,
                    version: '*',
                    files: [{
                        content: code
                    }],
                    stdin: stdin,
                    args: [],
                    compile_timeout: 10000,
                    run_timeout: 3000,
                    compile_memory_limit: -1,
                    run_memory_limit: -1
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Execution failed');
            }

            const embed = new EmbedBuilder()
                .setTitle(`🚀 Code Execution: ${language}`)
                .setColor(result.run && result.run.code === 0 ? 0x00FF00 : 0xFF0000)
                .addFields(
                    { name: '📝 Code', value: `\`\`\`${language}\n${code.slice(0, 1000)}\n\`\`\``, inline: false }
                );

            if (stdin) {
                embed.addFields({ name: '📥 Input', value: `\`\`\`\n${stdin.slice(0, 500)}\n\`\`\``, inline: false });
            }

            if (result.compile && result.compile.output) {
                embed.addFields({ 
                    name: '⚙️ Compile Output', 
                    value: `\`\`\`\n${result.compile.output.slice(0, 1000)}\n\`\`\``, 
                    inline: false 
                });
            }

            if (result.run) {
                const output = result.run.output || '(no output)';
                embed.addFields({ 
                    name: '📤 Output', 
                    value: `\`\`\`\n${output.slice(0, 1000)}\n\`\`\``, 
                    inline: false 
                });
                
                embed.addFields(
                    { name: 'Exit Code', value: `${result.run.code}`, inline: true },
                    { name: 'Signal', value: result.run.signal || 'None', inline: true }
                );
            }

            if (result.run && result.run.stderr) {
                embed.addFields({ 
                    name: '⚠️ Errors', 
                    value: `\`\`\`\n${result.run.stderr.slice(0, 1000)}\n\`\`\``, 
                    inline: false 
                });
            }

            embed.setFooter({ text: `Language: ${language} | Version: ${result.version || 'latest'}` });
            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Execution Error')
                .setDescription(`\`\`\`\n${error.message}\n\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
