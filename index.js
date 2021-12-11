/* eslint-disable no-unused-vars */
const { Client, Intents, Collection, } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const fs = require("fs")
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { MocciLogging } =require('./utils/moccilogger')
const dotenv = require('dotenv')
const anim = require('chalk-animation')
dotenv.config();
const TOKEN = process.env['BOT_TOKEN']
const cmdfiles = fs.readdirSync('./interactions/').filter(file => file.endsWith('.js'))
const TEST_GUILD_ID = ''
const commands = [];
const isdebug = process.env['DEBUG']

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
    log('Listening to interactions.....', 2)
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    debug(`New Interaction Accepted`)
    log('Waiting for interactions....', 2)
    try {
        await command.execute(interaction)
    } catch (error) {
        if (error) console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})
//Aliases
function debug(msg) {
MocciLogging.log(msg, MocciLogging.DEBUG)
}
function log(msg, int) {
MocciLogging.log(msg, int)
}
anim.rainbow('Logging in............')
client.login(TOKEN);
