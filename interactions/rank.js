const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your or another user\'s rank and XP')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check rank for')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const guildId = interaction.guild.id;

            const userData = await DB.getUserLevel(guildId, targetUser.id);
            const leaderboard = await DB.getLeaderboard(guildId, 100);
            const rank = leaderboard.findIndex(u => u.user_id === targetUser.id) + 1;

            const xp = userData.xp || 0;
            const level = userData.level || 1;
            
            // Calculate XP needed for next level
            const xpForNext = Math.pow((level + 1) / 0.1, 2);
            const xpForCurrent = level > 1 ? Math.pow(level / 0.1, 2) : 0;
            const xpProgress = Math.max(0, xp - xpForCurrent); // Ensure non-negative
            const xpNeeded = xpForNext - xpForCurrent;
            const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100)); // Clamp 0-100

            // Create rank card
            const canvas = createCanvas(900, 250);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Avatar circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(125, 125, 90, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            
            const avatarURL = targetUser.displayAvatarURL({ extension: 'png', size: 256 });
            try {
                const avatar = await loadImage(avatarURL);
                ctx.drawImage(avatar, 35, 35, 180, 180);
            } catch (err) {
                // Fallback: draw colored circle
                ctx.fillStyle = '#7289da';
                ctx.fill();
            }
            ctx.restore();

            // Avatar border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(125, 125, 90, 0, Math.PI * 2);
            ctx.stroke();

            // Username
            ctx.font = 'bold 36px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(targetUser.username, 240, 70);

            // Level and Rank
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`Level ${level}`, 240, 110);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`Rank #${rank || 'N/A'}`, 450, 110);

            // XP Progress bar background
            const barX = 240;
            const barY = 140;
            const barWidth = 620;
            const barHeight = 40;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // XP Progress bar fill
            const progressGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            progressGradient.addColorStop(0, '#00d4ff');
            progressGradient.addColorStop(1, '#0095ff');
            ctx.fillStyle = progressGradient;
            const fillWidth = Math.max(0, (barWidth * progressPercent) / 100);
            ctx.fillRect(barX, barY, fillWidth, barHeight);

            // XP Text
            ctx.font = 'bold 18px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            const displayXP = Math.max(0, Math.floor(xpProgress));
            const displayNeeded = Math.floor(xpNeeded);
            ctx.fillText(`${displayXP} / ${displayNeeded} XP`, barX + barWidth / 2, barY + 26);

            // Messages count
            ctx.textAlign = 'left';
            ctx.font = '20px sans-serif';
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(`Total Messages: ${userData.messages_count || 0}`, 240, 210);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });

            await interaction.editReply({ files: [attachment] });

        } catch (error) {
            console.error('Rank error:', error);
            
            const errorMessage = { 
                content: error.code === 'PGRST205' 
                    ? '⚠️ Database tables not set up yet! Please ask the server owner to run the Supabase schema.' 
                    : `Error: ${error.message}`, 
                flags: 1 << 6 
            };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMessage).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMessage).catch(() => {});
            }
        }
    }
};
