const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const os = require('os');
const pkg = require('../package.json');

const hostname = os.hostname();
const platform = os.platform();
const headerversion = os.version();
const cpus = os.cpus();
const cputotal = cpus.length;
const model = cpus[0].model;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Show detailed Mocci Bot Info'),

	async execute(interaction) {
		try {
			await interaction.deferReply();
			const startTime = Date.now();

			// Bot uptime
			const botUptime = process.uptime();
			let botDays = Math.floor(botUptime / 86400);
			let botHours = Math.floor((botUptime % 86400) / 3600);
			let botMinutes = Math.floor((botUptime % 3600) / 60);
			let botSeconds = Math.floor(botUptime % 60);
			const botUptimeStr = `${botDays}d ${botHours}h ${botMinutes}m ${botSeconds}s`;

			// System uptime
			let totalSeconds = os.uptime();
			let sysDays = Math.floor(totalSeconds / 86400);
			let sysHours = Math.floor((totalSeconds % 86400) / 3600);
			let sysMinutes = Math.floor((totalSeconds % 3600) / 60);
			let sysSeconds = Math.floor(totalSeconds % 60);
			const sysUptimeStr = `${sysDays}d ${sysHours}h ${sysMinutes}m ${sysSeconds}s`;

			// Memory info
			const freemem = (os.freemem() / (1024 ** 3)).toFixed(2);
			const totalmem = (os.totalmem() / (1024 ** 3)).toFixed(2);
			const usedmem = (totalmem - freemem).toFixed(2);
			const memPercentage = ((usedmem / totalmem) * 100).toFixed(1);

			// Bot info
			const botVersion = pkg.version || 'Unknown';
			const botAuthor = pkg.author || 'Unknown';
			const botName = pkg.name || 'Mocci';
			const botDesc = pkg.description || 'A Discord bot for developers';
			const nodeVersion = process.version;
			const djsVersion = require('discord.js').version;

			// Server info
			const guild = interaction.guild;
			const serverName = guild ? guild.name : 'Direct Message';
			const memberCount = guild ? guild.memberCount.toLocaleString() : 'N/A';
			const channelCount = guild ? guild.channels.cache.size.toLocaleString() : 'N/A';
			const roleCount = guild ? guild.roles.cache.size.toLocaleString() : 'N/A';

			// Bot statistics
			const totalServers = interaction.client.guilds.cache.size.toLocaleString();
			const totalUsers = interaction.client.users.cache.size.toLocaleString();
			const totalChannels = interaction.client.channels.cache.size.toLocaleString();
			const totalCommands = interaction.client.commands ? interaction.client.commands.size : 'N/A';

			// Calculate accurate response delay
			const responseDelay = Date.now() - startTime;
			const wsLatency = interaction.client.ws.ping;

			// Use ADMINISTRATOR permission (8) for full access
			const permissions = '8';
			const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=${permissions}&scope=bot%20applications.commands`;
			
			const about = new EmbedBuilder()
				.setColor('#5865F2')
				.setAuthor({ 
					name: `${botName} - Bot Information`,
					iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
				})
				.setDescription(`> ${botDesc}\n\n**📊 Global Statistics**\n\`\`\`yml\nServers: ${totalServers}\nUsers: ${totalUsers}\nChannels: ${totalChannels}\nCommands: ${totalCommands}\`\`\``)
				.addFields(
					{ 
						name: '📦 Bot Details', 
						value: `\`\`\`yml\nVersion: ${botVersion}\nAuthor: ${botAuthor}\nNode.js: ${nodeVersion}\nDiscord.js: v${djsVersion}\`\`\``,
						inline: true
					},
					{ 
						name: '⏱️ Uptime & Latency', 
						value: `\`\`\`yml\nBot Uptime: ${botUptimeStr}\nWebSocket: ${wsLatency}ms\nResponse: ${responseDelay}ms\`\`\``,
						inline: true
					},
					{ 
						name: '🖥️ System Information', 
						value: `\`\`\`yml\nOS: ${platform}\nCPU: ${model}\nCores: ${cputotal}\nHostname: ${hostname}\`\`\``,
						inline: false
					},
					{ 
						name: '💾 Memory Usage', 
						value: `\`\`\`yml\nUsed: ${usedmem} GB (${memPercentage}%)\nFree: ${freemem} GB\nTotal: ${totalmem} GB\`\`\``,
						inline: true
					},
					{ 
						name: '⏳ System Uptime', 
						value: `\`\`\`yml\n${sysUptimeStr}\`\`\``,
						inline: true
					},
					{ 
						name: '📍 Current Server', 
						value: `\`\`\`yml\nName: ${serverName}\nMembers: ${memberCount}\nChannels: ${channelCount}\nRoles: ${roleCount}\`\`\``,
						inline: false
					}
				)
				.addFields(
					{ name: '🔗 Links', value: `[GitHub](https://github.com/Khuirul-Huda/Mocci) • [Invite Bot](${inviteUrl}) • [Support](/support)`, inline: false }
				)
				.setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
				.setFooter({ 
					text: `Requested by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [about] });
		} catch (error) {
			console.error('Error in /about command:', error);
			const errorReply = { content: '❌ Error displaying about information.', ephemeral: true };
			if (interaction.deferred) {
				await interaction.editReply(errorReply);
			} else {
				await interaction.reply(errorReply);
			}
		}
	}
};