/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
const { Client, Intents } = require('discord.js');
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
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});
const player = createAudioPlayer();

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
        await playCommand(interaction, client, servers, player);
        break;
      case 'playfile':
        await playFileCommand(interaction, client, servers, player);
        break;
      case 'stop':
        await stopCommand(interaction, client, servers, player);
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

client.login(process.env.token);
