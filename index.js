/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
const { Client, IntentsBitField, GatewayIntentBits } = require('discord.js');
const {
  createAudioPlayer,
  AudioPlayerStatus,
  generateDependencyReport,
} = require('@discordjs/voice');
const { pongCommand } = require('./commands');
const { serverCommand, userCommand } = require('./commands/general');
const {
  playCommand,
  playFileCommand,
  stopCommand,
  queueCommand,
  pauseCommand,
  unpauseCommand,
  skipCommand,
  backCommand,
  searchCommand,
} = require('./commands/music');
const { rollCommand } = require('./commands/dice');
const { initializeCommand } = require('./commands/admin');

require('dotenv').config();

const servers = {};

// console.log(generateDependencyReport());

// Create a new client instance
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds, // LETS THE BOT USE INFORMATION ABOUT SERVERS (GUILDS) TO DO WHAT IT DOES
    IntentsBitField.Flags.GuildVoiceStates, // LETS THE BOT CHECK THAT USERS ARE IN A VOICE CHANNEL TO PLAY AUDIO IN THE CHANNEL
    IntentsBitField.Flags.DirectMessages, // LETS YOU COMMUNICATE WITH THE BOT IN DIRECT MESSAGE
    GatewayIntentBits.MessageContent, // LETS THE BOT GET MESSAGE ATTACHMENTS TO PLAY AUDIO FILES
  ],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const Member = await Guild.members.cache.get(interaction.member.user.id);
  const server = servers[Guild.id];
  const requiredRoles = server?.roles || [];
  const isCommand = interaction.isCommand();

  if (isCommand && interaction.commandName === 'initialize') {
    await initializeCommand(interaction, client, servers);
    return;
  }

  if (!server) {
    await interaction.reply(
      'Please initialize the bot before using it! You can do this by calling "/initialize".'
    );
    return;
  }

  if (isCommand) {
    const { commandName } = interaction;

    if (
      !requiredRoles.includes('*') &&
      !Member.roles.cache.some((role) =>
        [
          ...requiredRoles,
          'Server Owner',
          'Admin',
          'Mod',
          'Server Manager',
        ].includes(role.name)
      )
    ) {
      await interaction.reply('You do not have permissions to use me!');
      return;
    }

    switch (commandName) {
      case 'ping':
        await pongCommand(interaction);
        break;
      case 'server':
        await serverCommand(interaction);
        break;
      case 'user':
        await userCommand(interaction, client);
        break;
      case 'play':
        await playCommand(interaction, client, servers);
        break;
      case 'playfile':
        await playFileCommand(interaction, client, servers);
        break;
      case 'stop':
        await stopCommand(interaction, client, servers);
        break;
      case 'queue':
        await queueCommand(interaction, client, servers);
        break;
      case 'pause':
        await pauseCommand(interaction, client, servers);
        break;
      case 'unpause':
        await unpauseCommand(interaction, client, servers);
        break;
      case 'skip':
        await skipCommand(interaction, client, servers);
        break;
      case 'back':
        await backCommand(interaction, client, servers);
        break;
      case 'search':
        await searchCommand(interaction, client, servers);
        break;
      case 'roll':
        await rollCommand(interaction);
        break;
      default:
        break;
    }
  }
});

const clearCommands = async (Guild, interaction) => {
  await Guild.commands.set([]);
  interaction.reply('Cleared commands!');
};

client.login(process.env.token);
