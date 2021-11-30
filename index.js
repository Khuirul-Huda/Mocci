/* eslint-disable no-unused-vars */
const { Client, Intents, Collection,  } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { Routes } = require("discord-api-types/v9");
const { REST } = require("discord-api-types/rest");
const commands = [];
const fs = require("fs");
// Load  cmd
const commandDir = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
require("dotenv").config();
const dotenv = require("dotenv");
const envFILE = dotenv.config();
client.commands = new Collection();
const TEST_GUILD_ID = envFILE.parsed['TEST_GUILD_ID'];




for (const file of commandDir) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    const CLIENT_ID = client.user.id;
    console.log('Starting Mocci Discord Bot....');
   /* const rest = new REST({
        version: '9'
    }).setToken(process.env.BOT_TOKEN);
    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();*/

});




client.login(process.env.BOT_TOKEN);

