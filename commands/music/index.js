/* eslint-disable no-unused-vars */
/* eslint-disable indent */
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
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

const Youtube = google.youtube('v3');

const playCommand = async (interaction, client, servers, player) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const Member = await Guild.members.cache.get(interaction.member.user.id);
  const videoString = interaction.options.getString('video');

  const play = (connection, message) => {
    const server = servers[Guild.id];

    // server.dispatcher = connection.playStream(
    //   ytdl(server.queue[0], { filter: 'audioonly' })
    // );

    // Will use FFmpeg with volume control enabled
    const resource = createAudioResource(
      ytdl(server.queue[0], { filter: 'audioonly' }),
      {
        inlineVolume: true,
      }
    );

    resource.volume.setVolume(0.5);
    server.dispatcher = player; // TODO: Fix
    player.play(resource);

    server.queue.shift();

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Idling');
      server.queue[0]
        ? play(connection, 6)
        : () => {
            if (connection) connection.destroy();
          };
    });
  };

  if (!Member.voice.channel) {
    await interaction.reply('You must be in a voice channel to play a video!');
  } else {
    const voiceChannelId = Member.voice.channel.id;

    if (!servers || !servers[Guild.id]) {
      console.log('Creating queue');
      servers[Guild.id] = { queue: [] };
    }

    const server = servers[Guild.id];
    server.queue.push(videoString);

    // make sure bot is in voice
    if (!getVoiceConnection(Guild.id)) {
      console.log('No existing connections');
      await joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: Guild.id,
        adapterCreator: Guild.voiceAdapterCreator,
      });
      const connection = await getVoiceConnection(Guild.id);
      connection.subscribe(player);
      play(connection, videoString);
    }

    const message = `Playing video: ${videoString}`;

    await interaction.reply(message);
  }
};

const queueCommand = async (interaction, client, servers) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  // const connection = getVoiceConnection(Guild.id);
  const queue = servers[Guild.id].queue;
  console.log(servers[Guild.id].dispatcher);

  if (!queue) {
    console.log('Queue Command: No queue');
  } else {
    const message = ['Queue:', ...queue.map((url, i) => `${i}. ${url}`)].join(
      '\n'
    );

    await interaction.reply(message);
  }
};

const pauseCommand = async (interaction, client, servers) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const server = servers[Guild.id];
  const { dispatcher: player, queue } = server;

  if (!queue || player._state.status !== AudioPlayerStatus.Playing) {
    console.log('Audio cannot be paused because is not playing!');
  } else {
    player.pause();
    const message = 'Audio has paused';

    await interaction.reply(message);
  }
};

const unpauseCommand = async (interaction, client, servers) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const server = servers[Guild.id];
  const { dispatcher: player, queue } = server;

  if (!queue || player._state.status !== AudioPlayerStatus.Paused) {
    console.log('Audio is not paused!');
  } else {
    player.unpause();
    const message = 'Audio has resumed';

    await interaction.reply(message);
  }
};

const stopCommand = async (interaction, client, servers) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  // const Member = Guild.members.cache.get(interaction.member.user.id);
  const connection = getVoiceConnection(Guild.id);

  if (connection) {
    connection.destroy();
  }

  servers[Guild.id] = { queue: [] };

  const message = 'Bye boi';
  await interaction.reply(message);
};

// const start = async (player, queue) => {
//   if (!queue || queue.length === 0) {
//     console.log('Nothing in queue');
//   }

//   await player.play(queue[0]);

//   console.log(`Playing: ${queue.shift()}`);

//   try {
//     await entersState(player, AudioPlayerStatus.Idle, 5_000);
//     // The player has entered the Playing state within 5 seconds
//     console.log('Playback has started!');
//   } catch (error) {
//     // The player has not entered the Playing state and either:
//     // 1) The 'error' event has been emitted and should be handled
//     // 2) 5 seconds have passed
//     console.error(error);
//   }
// };

const searchCommand = async (interaction, client) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const searchString = interaction.options.getString('query');
  const auth = await authenticate({
    keyfilePath: join(__dirname, '../../oauth2.keys.json'),
    scopes: ['https://www.googleapis.com/auth/youtube'],
  });
  google.options({ auth });
  // const connection = getVoiceConnection(Guild.id);

  const res = await Youtube.search.list({
    part: 'id,snippet',
    q: searchString,
  });
  console.log(res.data);
};

module.exports = {
  playCommand,
  stopCommand,
  queueCommand,
  pauseCommand,
  unpauseCommand,
  searchCommand,
};
