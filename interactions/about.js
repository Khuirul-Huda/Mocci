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
			// Calculate uptime
			let totalSeconds = os.uptime();
			let days = Math.floor(totalSeconds / 86400);
			totalSeconds %= 86400;
			let hours = Math.floor(totalSeconds / 3600);
			totalSeconds %= 3600;
			let minutes = Math.floor(totalSeconds / 60);
			let seconds = Math.floor(totalSeconds % 60);

			const uptime = `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
			const freemem = `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`;
			const totalmem = `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`;
			const memoryinfo = `${freemem} / ${totalmem}`;
			const time = Date.now() - interaction.createdTimestamp;

			// Bot info
			const botVersion = pkg.version || 'Unknown';
			const botAuthor = pkg.author || 'Unknown';
			const botName = pkg.name || 'Mocci';
			const botDesc = pkg.description || 'A Discord bot.';

			// Server info
			const guild = interaction.guild;
			const serverName = guild ? guild.name : 'DM';
			const memberCount = guild ? guild.memberCount : 'N/A';

			const sysinfo = `**Hostname:** ${hostname}\n**Platform:** ${platform}\n**Header:** ${headerversion}\n**CPU:** ${model} x${cputotal}\n**Memory:** ${memoryinfo}\n**System Uptime:** ${uptime}`;

			// Use ADMINISTRATOR permission (8) for full access
			const permissions = '8';
			const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=${permissions}&scope=bot%20applications.commands`;
			const about = new EmbedBuilder()
				.setColor('#31ff08')
				.setTitle(`About ${botName}`)
				.setDescription(`${botDesc}\n\n**Version:** ${botVersion}\n**Author:** ${botAuthor}`)
				.addFields(
					{ name: 'System Info', value: sysinfo },
					{ name: 'Server', value: `**Name:** ${serverName}\n**Members:** ${memberCount}` },
					{ name: 'Response Delay', value: `${time} ms`, inline: true },
					{ name: 'Source Code', value: '[GitHub](https://github.com/Khuirul-Huda/Mocci)', inline: true },
					{ name: 'Invite Me', value: `[Invite this bot](${inviteUrl})`, inline: true }
				)
				.setFooter({ text: 'Support us with /support' })
				.setTimestamp();

			await interaction.reply({ embeds: [about] });
		} catch (error) {
			await interaction.reply({ content: 'Error displaying about info.', flags: 1 << 6 });
		}
	}
};