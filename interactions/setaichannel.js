const { SlashCommandBuilder, ChannelType } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setaichannel')
    .setDescription('Set the current channel as the AI chat channel (server owner only)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to use for AI chat')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', flags: 1 << 6 });
      return;
    }
    if (interaction.user.id !== interaction.guild.ownerId) {
      await interaction.reply({ content: 'Only the server owner can set the AI channel.', flags: 1 << 6 });
      return;
    }
    const channel = interaction.options.getChannel('channel');
    
    try {
      await DB.setAIChannel(interaction.guild.id, channel.id);
      await interaction.reply({ content: `AI chat channel set to <#${channel.id}>.` });
    } catch (error) {
      console.error('Error setting AI channel:', error);
      await interaction.reply({ content: 'Failed to set AI channel. Please try again.', flags: 1 << 6 });
    }
  }
};
