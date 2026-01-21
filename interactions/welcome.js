const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure welcome messages')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up welcome system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Welcome channel')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Welcome message (use {user}, {server}, {count})')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test the welcome message')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable welcome messages')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({ content: 'You need Manage Server permission!', flags: 1 << 6 });
            return;
        }

        try {
            if (subcommand === 'setup') {
                const channel = interaction.options.getChannel('channel');
                const message = interaction.options.getString('message');

                await DB.setWelcomeConfig(
                    interaction.guild.id,
                    channel.id,
                    message,
                    true,
                    '#667eea'
                );

                await interaction.reply({ content: `✅ Welcome system set up in ${channel}!` });

            } else if (subcommand === 'test') {
                const config = await DB.getWelcomeConfig(interaction.guild.id);

                if (!config) {
                    await interaction.reply({ content: 'Welcome system not configured!', flags: 1 << 6 });
                    return;
                }

                await sendWelcomeMessage(interaction.client, interaction.guild, interaction.user);
                await interaction.reply({ content: 'Test welcome message sent!', flags: 1 << 6 });

            } else if (subcommand === 'disable') {
                await DB.deleteWelcomeConfig(interaction.guild.id);
                await interaction.reply({ content: '✅ Welcome system disabled!' });
            }

        } catch (error) {
            console.error('Welcome error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};

async function sendWelcomeMessage(client, guild, member) {
    try {
        const config = await DB.getWelcomeConfig(guild.id);
        if (!config) return;

        const channel = guild.channels.cache.get(config.channel_id);
        if (!channel) return;

        // Create welcome image
        const canvas = createCanvas(1000, 300);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, config.embed_color || '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Welcome text
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME!', canvas.width / 2, 80);

        // Avatar circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(500, 180, 70, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        try {
            const avatar = await loadImage(member.displayAvatarURL({ extension: 'png', size: 256 }));
            ctx.drawImage(avatar, 430, 110, 140, 140);
        } catch (err) {
            ctx.fillStyle = '#7289da';
            ctx.fill();
        }
        ctx.restore();

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(500, 180, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Username
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(member.username, canvas.width / 2, 270);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });

        // Format message
        let formattedMessage = config.message_template
            .replace(/\{user\}/g, `<@${member.id}>`)
            .replace(/\{server\}/g, guild.name)
            .replace(/\{count\}/g, guild.memberCount.toString());

        const embed = new EmbedBuilder()
            .setDescription(formattedMessage)
            .setImage('attachment://welcome.png')
            .setColor(config.embed_color || '#667eea')
            .setTimestamp();

        await channel.send({ embeds: [embed], files: [attachment] });

    } catch (error) {
        // Silently ignore table not found errors
        if (error.code !== 'PGRST205') {
            console.error('Send welcome message error:', error);
        }
    }
}

module.exports.sendWelcomeMessage = sendWelcomeMessage;
