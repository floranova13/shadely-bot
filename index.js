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
  let userHasPermissions = false;

  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (Member.roles.cache.some((role) => role.name === 'DM')) {
      userHasPermissions = true;

      console.log('User is a DM');
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
      case 'initialize':
        await initializeCommand(interaction, client, servers);
        break;
      default:
        break;
    }
  }
});

// // eslint-disable-next-line no-unused-vars
// player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
//   // if(servers[client]) {

//   // }
//   console.log({ newState }, { oldState });
// });

// Login to Discord with your client's token
client.login(process.env.token);
