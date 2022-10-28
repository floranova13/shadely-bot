/* eslint-disable no-unused-vars */
/* eslint-disable indent */
const ytdl = require('ytdl-core');
const { google, Auth } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
// const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
} = require('@discordjs/voice');

const Youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_KEY,
});

const playCommand = async (interaction, client, servers, player) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const Member = await Guild.members.cache.get(interaction.member.user.id);
  const videoString = interaction.options.getString('video');

  if (!servers[Guild.id]) {
    servers[Guild.id] = { queue: [], current: '' };
  }

  const server = servers[Guild.id];

  const play = (connection) => {
    // Will use FFmpeg with volume control enabled
    const resource = createAudioResource(
      ytdl(server.queue[0], { filter: 'audioonly' }),
      {
        inlineVolume: true,
      }
    );

    resource.volume.setVolume(0.5);
    server.dispatcher = player;
    player.play(resource);
    server.queue.shift();

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Idling');
      server.queue[0]
        ? play(connection)
        : () => {
            if (connection) connection.destroy();
          };
    });
  };

  if (!Member.voice.channel) {
    await interaction.reply('You must be in a voice channel to play a video!');
  } else {
    const voiceChannelId = Member.voice.channel.id;
    server.queue.push(videoString);

    // make sure bot is in voice
    if (!getVoiceConnection(Guild.id)) {
      await joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: Guild.id,
        adapterCreator: Guild.voiceAdapterCreator,
      });
      const connection = await getVoiceConnection(Guild.id);
      connection.subscribe(player);
      play(connection);
    }

    const message = `Playing video: ${videoString}`;

    await interaction.reply(message);
  }
};

const queueCommand = async (interaction, client, servers) => {
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const queue = servers[Guild.id].queue;
    let message;

    if (!queue) {
      message = 'There is currently no queue to display!';
    } else {
      message = ['Queue:', ...queue.map((url, i) => `${i}. ${url}`)].join('\n');
    }

    await interaction.reply(message);
  } catch (error) {
    console.error('ERROR OCCURED IN queueCommand!');
  }
};

const pauseCommand = async (interaction, client, servers) => {
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const server = servers[Guild.id];
    const { dispatcher: player, queue } = server;
    let message;

    if (!queue || player._state.status !== AudioPlayerStatus.Playing) {
      message = 'Audio cannot be paused because it is not playing!';
    } else {
      player.pause();
      message = 'Audio has paused';
    }

    await interaction.reply(message);
  } catch (error) {
    console.error('ERROR OCCURED IN pauseCommand!');
  }
};

const unpauseCommand = async (interaction, client, servers) => {
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const server = servers[Guild.id];
    const { dispatcher: player, queue } = server;
    let message;

    if (!queue || player._state.status !== AudioPlayerStatus.Paused) {
      message = 'Audio is not paused!';
    } else {
      player.unpause();
      message = 'Audio has resumed';
    }

    await interaction.reply(message);
  } catch (error) {
    console.error('ERROR OCCURED IN unpauseCommand!');
  }
};

const stopCommand = async (interaction, client, servers) => {
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const connection = getVoiceConnection(Guild.id);
    const goodbyeMessage = 'Bye boi!';

    if (connection) {
      connection.destroy();
    }

    servers[Guild.id] = { queue: [] };
    await interaction.reply(goodbyeMessage);
  } catch (error) {
    console.error('ERROR OCCURED IN stopCommand!');
  }
};

const searchCommand = async (interaction, client) => {
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const searchString = interaction.options.getString('query');
    const res = await Youtube.search.list({
      part: 'id,snippet',
      q: searchString,
      key: process.env.YOUTUBE_KEY,
    });

    interaction.reply(
      `Video Found: https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`
    );
  } catch (error) {
    const searchString = interaction.options.getString('query');
    console.error(
      'ERROR OCCURED IN searchCommand!',
      'Input: ',
      searchString,
      '.'
    );
  }
};

module.exports = {
  playCommand,
  stopCommand,
  queueCommand,
  pauseCommand,
  unpauseCommand,
  searchCommand,
};
