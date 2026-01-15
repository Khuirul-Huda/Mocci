const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command or all commands (owner only).')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to reload (leave empty to reload all)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const ownerId = process.env.OWNER_USER_ID;
      if (interaction.user.id !== ownerId) {
        await interaction.reply({ content: 'Only the bot owner can use this command.', flags: 1 << 6 });
        return;
      }
      const commandName = interaction.options.getString('command');
      const commandsPath = path.join(__dirname);
      if (!commandName) {
        // Reload all commands
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        let reloaded = [];
        let failed = [];
        for (const file of commandFiles) {
          try {
            delete require.cache[require.resolve(path.join(commandsPath, file))];
            const newCommand = require(path.join(commandsPath, file));
            if (newCommand.data && newCommand.execute) {
              interaction.client.commands.set(newCommand.data.name, newCommand);
              reloaded.push(newCommand.data.name);
            }
          } catch (error) {
            failed.push(`${file}: ${error.message}`);
          }
        }
        let msg = `Reloaded commands: ${reloaded.join(', ')}`;
        if (failed.length) msg += `\nFailed: ${failed.join(', ')}`;
        await interaction.reply({ content: msg, flags: 1 << 6 });
        return;
      }
      // Reload single command
      const command = interaction.client.commands.get(commandName);
      if (!command) {
        await interaction.reply({ content: `There is no command with name \`${commandName}\`!`, flags: 1 << 6 });
        return;
      }
      const filePath = path.join(commandsPath, `${command.data.name}.js`);
      try {
        delete require.cache[require.resolve(filePath)];
        const newCommand = require(filePath);
        interaction.client.commands.set(newCommand.data.name, newCommand);
        await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, flags: 1 << 6 });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: `There was an error while reloading a command \`${command.data.name}\`:\n${error.message}`, flags: 1 << 6 });
      }
  }
};
