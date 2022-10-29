const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const generalCommands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!'),
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!'),
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a YouTube video!')
    .addStringOption((option) =>
      option
        .setName('video')
        .setDescription('The video to play')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('playfile')
    .setDescription('Play an audio file posted in a recent message!'),
  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Gets the video queue!'),
  new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses playback of audio!'),
  new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Unpauses playback of audio!'),
  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Searches for a youtube video!')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The video to search for')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('stop').setDescription('Stop everything!'),
  new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a specified die!')
    .addIntegerOption((option) =>
      option
        .setName('die')
        .setDescription('The max possible roll')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('initialize')
    .setDescription('Initializes the bot!'),
];

const commands = [...generalCommands].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.token);

rest
  .put(Routes.applicationCommands(process.env.clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
