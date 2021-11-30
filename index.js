/* eslint-disable no-unused-vars */
const { Client, Intents, Collection, } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const fs = require("fs")
const {
    REST
} = require('@discordjs/rest')
const {
    Routes
} = require('discord-api-types/v9')

const dotenv = require('dotenv');
dotenv.config();
const TOKEN = process.env['BOT_TOKEN'];

const cmdfiles = fs.readdirSync('./interactions/').filter(file => file.endsWith('.js'))
//const TEST_GUILD_ID = process.env['TEST_GUILD_ID']
const TEST_GUILD_ID = ''
const commands = [];

// Creating a collection for commands in client
client.commands = new Collection();

for (const file of cmdfiles) {
    const command = require(`./interactions/${file}`)
    commands.push(command.data.toJSON())
    debug(`Registering ${file}`)
    client.commands.set(command.data.name, command)
    debug(`Found ${command.data.name} `)
}

function debug(txt) {
    console.log('Debug: '+txt)    
}

client.once('ready', () => {
    const CLIENT_ID = client.user.id;
    console.log('Starting Mocci Discord Bot....')
    console.log(`Client ID: ${CLIENT_ID}`)
    
    const rest = new REST({
        version: '9'
    }).setToken(TOKEN);

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
    })();

});

client.on('interactionCreate', async interaction => {
    debug('New Interaction')
    if (!interaction.isCommand()) return;
    debug('Detected as Command')
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(TOKEN);

