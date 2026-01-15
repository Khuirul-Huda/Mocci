const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const aichannelsPath = path.join(__dirname, '../utils/aichannels.json');

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
    let aichannels = {};
    if (fs.existsSync(aichannelsPath)) {
      aichannels = JSON.parse(fs.readFileSync(aichannelsPath, 'utf8'));
    }
    aichannels[interaction.guild.id] = channel.id;
    fs.writeFileSync(aichannelsPath, JSON.stringify(aichannels, null, 2));
    await interaction.reply({ content: `AI chat channel set to <#${channel.id}>.` });
  }
};
