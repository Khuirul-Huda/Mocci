/* eslint-disable no-unused-vars */
const { Client, Intents, Collection, } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const fs = require("fs")
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const dotenv = require('dotenv')
const anim = require('chalk-animation')
dotenv.config();
const TOKEN = process.env['BOT_TOKEN']
const isDebug = process.env['DEBUG_MODE']
const cmdfiles = fs.readdirSync('./interactions/').filter(file => file.endsWith('.js'))
const TEST_GUILD_ID = ''
const commands = [];

client.commands = new Collection();

for (const file of cmdfiles) {
    const command = require(`./interactions/${file}`)
    commands.push(command.data.toJSON())
    debug(`Registering ${file}`)
    client.commands.set(command.data.name, command)
}


client.once('ready', () => {
    const CLIENT_ID = client.user.id;
    log('Bot ready...', 2)
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
                debug('Successfully registered application commands globally')
               
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                    body: commands
                },
                );
                debug('Successfully registered application commands for development guild')
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
    client.user.setActivity('UNGE', { type: 'STREAMING', name: 'unge', url: 'https://go.khuirulhuda.my.id/discord' })
    anim.rainbow('Listening to interactions.....')
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    debug(`New Interaction Accepted`)
    try {
        await command.execute(interaction)
    } catch (error) {
        if (error) console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})

client.on('messageDelete', message => {
debug(`Message deleted: ${message}`)
})

//Logging
function debug(txt) {
    log(txt, 1)
}

/**
 * 
 * @param {string} string - Message
 * @param {number} level - 1 = debug, 2 = info, 3 = warning, 4 = critical
 */

function log(message, level) {
    const colorize = require('colors')
    if (level > 4 || level <= 0 ) return
    const prefix = (level == 1) ? '[DEBUG]' : (level == 2 ) ? '[INFO]' : (level == 3 ) ? '[WARN]' : '[CRITICAL]'
    const separator = ' '
    const output = prefix + separator + message

    console.log((level == 1) ? output.white : (level == 2 ) ? output.blue : (level == 3 ) ? output.yellow : output.red)
}

anim.rainbow('Logging in............')
client.login(TOKEN);