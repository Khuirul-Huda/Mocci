
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows all commands'),
	async execute(interaction) {
		try {
			const commands = interaction.client.commands;
			const botUser = interaction.client.user;
			const embed = new EmbedBuilder()
				.setTitle('🤖 Mocci Bot Help')
				.setColor(0x5865F2)
				.setThumbnail(botUser.displayAvatarURL())
				.setDescription('Welcome to Mocci! Here are my available commands:')
				.addFields(
					{ name: 'General', value: commands.filter(cmd => ['about','help','avatar','userinfo','serverinfo','ai','quote','weather'].includes(cmd.data.name)).map(cmd => `</${cmd.data.name}:${cmd.data.name}> — ${cmd.data.description}`).join('\n') || 'None' },
					{ name: 'Fun & Utility', value: commands.filter(cmd => ['random','enchant','poll','screenshot'].includes(cmd.data.name)).map(cmd => `</${cmd.data.name}:${cmd.data.name}> — ${cmd.data.description}`).join('\n') || 'None' },
					{ name: 'Admin/Owner', value: commands.filter(cmd => ['setactivity'].includes(cmd.data.name)).map(cmd => `</${cmd.data.name}:${cmd.data.name}> — ${cmd.data.description}`).join('\n') || 'None' }
				)
				.setFooter({ text: 'Tip: Use /<command> for details. Need help? Contact the bot owner.' });

			// 8 = ADMINISTRATOR, grants all permissions
			const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${botUser.id}&permissions=8&scope=bot%20applications.commands`;
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel('Invite Mocci')
					.setStyle(ButtonStyle.Link)
					.setURL(inviteUrl),
				new ButtonBuilder()
					.setLabel('Support Server')
					.setStyle(ButtonStyle.Link)
					.setURL('https://go.khuirulhuda.my.id/discord')
			);

			await interaction.reply({ embeds: [embed], components: [row] });
		} catch (error) {
			await interaction.reply({ content: 'Error displaying help.', flags: 1 << 6 });
		}
	}
};