/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const { google, Auth } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
// const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const fs = require('fs');
const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
} = require('@discordjs/voice');
const {
  joinVoice,
  createPlayer,
  getOrCreateVoiceConnection,
  playAudio,
  startPlayerListener,
} = require('./utils');
const Youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_KEY,
});

const playCommand = async (interaction, client, servers) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const Member = await Guild.members.cache.get(interaction.member.user.id);
  const videoString = interaction.options.getString('video');

  if (
    !videoString ||
    !videoString.includes('https://www.youtube.com/watch?v=')
  ) {
    return interaction.reply(
      "You didn't provide a valid YouTube URL! You better do it right next time!"
    );
  }

  if (!Member.voice.channel) {
    return interaction.reply('You must be in a voice channel to play a video!');
  }

  const videoId = videoString.split('=')[videoString.split('=').length - 1];
  const res = await Youtube.videos.list({
    part: 'id,snippet',
    id: videoId,
    key: process.env.YOUTUBE_KEY,
  });
  const videoTitle = res.data.items[0].snippet.title;
  const server = servers[Guild.id];
  const { queue, oldQueue } = server;
  let { player } = server;

  if (!player) {
    await createPlayer(server, Guild);
    player = server.player;
  }

  queue.push({ video: videoString, title: videoTitle, isLocal: false });

  const connection = await getOrCreateVoiceConnection(Guild, Member, player, server);

  if (
    player._state.status !== AudioPlayerStatus.Playing &&
    player._state.status !== AudioPlayerStatus.Paused
  ) {
    playAudio(Guild, interaction.channel, server, connection);
  }

  await interaction.reply(`Queued: ${videoString}`);
};

const queueCommand = async (interaction, client, servers) => {
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const { queue, current, player } = servers[Guild.id];
    let message;

    if (
      !queue.length === 0 &&
      player._state.status !== AudioPlayerStatus.Paused &&
      player._state.status !== AudioPlayerStatus.Playing
    ) {
      message = 'There is currently no queue to display!';
    } else {
      const queueArr = current ? [current, ...queue] : [...queue];
      message = [
        '**Queue:**',
        '**---------------------------------------------------------**',
        queueArr.map((item, i) => `|  **[${i + 1}.]**  ${item.title.trim()}`),
      ].join('\n');
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
    const { player, queue } = server;
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
    const { player, queue } = server;
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

const skipCommand = async (interaction, client, servers) => {
  // TODO: Actually write these methods
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const server = servers[Guild.id];
    const { player, queue } = server;
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

const backCommand = async (interaction, client, servers) => {
  // TODO: Actually write these methods
  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const server = servers[Guild.id];
    const { player, queue } = server;
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
      chart: 'mostPopular',
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

const playFileCommand = async (interaction, client, servers, player) => {
  let message;

  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const Member = await Guild.members.cache.get(interaction.member.user.id);
    const server = servers[Guild.id];
    const messageObject = await interaction.channel.messages.fetch({
      limit: 10,
    });
    const latestMessages = Array.from(messageObject.values()).filter(
      (currentMessage) => currentMessage.author.id === interaction.user.id
    );

    if (latestMessages) {
      let foundAttachment = false;
      for (let i = latestMessages.length - 1; i >= 0; i--) {
        const currentMessage = latestMessages[i];
        const currentMessageAttachments = Array.from(
          currentMessage.attachments.values()
        );
        if (
          currentMessage.author.id === interaction.user.id &&
          currentMessageAttachments.length
        ) {
          foundAttachment = true;
          const serverName = (
            Guild || { name: 'Direct Messages' }
          ).name.replace(/\//g, '_');
          const channelName = (
            currentMessage.channel.name || currentMessage.channel.recipient.name
          ).replace(/\//g, '_');
          const Channel = currentMessage.channel;
          const foundFile = currentMessageAttachments[0];
          const dirPath = join(
            __dirname,
            `/downloads${serverName}/${channelName}`
          );
          const filePath = `${dirPath}/${foundFile.name}`;
          const fileName = foundFile.name.split('.')[0];

          await fs.mkdir(dirPath, { recursive: true }, (err) =>
            console.log(
              err
                ? 'Directory Failed to be created'
                : 'Directory created successfully!'
            )
          );
          interaction.reply(`Downloading: ${foundFile.name}`);
          console.log(foundFile);
          downloadFile(
            foundFile.url,
            filePath,
            fileName,
            Guild,
            Member,
            Channel,
            server
          );
        }
      }
      if (!foundAttachment) {
        interaction.reply('No file found! Did you just lie to me?!');
      }
    }
  } catch (error) {
    interaction.reply('Error!');
    console.error('ERROR OCCURED IN playFileCommand!');
  }
};

const downloadFile = async (
  url,
  path,
  fileName,
  Guild,
  Member,
  Channel,
  server
) => {
  try {
    const res = await fetch(url);
    fs.stat(path, async (err, stat) => {
      if (!err) {
        console.log('File exists');
        playAudioFile(path, fileName, Guild, Member, Channel, server);
      } else if (err.code === 'ENOENT') {
        // file does not exist
        const fileStream = fs.createWriteStream(path);

        await new Promise((resolve, reject) => {
          res.body.pipe(fileStream);
          res.body.on('error', reject);
          fileStream.on('finish', resolve);
        });

        playAudioFile(path, Guild, Member, Channel, server);
      } else {
        console.error('Some other error: ', err.code);
      }
    });
  } catch (error) {
    console.error('ERROR OCCURED IN downloadFile METHOD!');
  }
};

const playAudioFile = async (
  path,
  fileName,
  Guild,
  Member,
  Channel,
  server
) => {
  try {
    const { queue, player } = server;

    if (!Member.voice.channel) {
      await Channel.send('You must be in a voice channel to play a video!');
      return;
    } else {
      if (!player) {
        createPlayer(server, Guild);
      }

      // make sure bot is in voice
      if (!getVoiceConnection(Guild.id)) {
        await joinVoice(Guild, Member, player);
      }

      // check if audio is playing or queued
      if (
        player._state.status !== AudioPlayerStatus.Paused &&
        player._state.status !== AudioPlayerStatus.Playing
      ) {
        const resource = createAudioResource(path, {
          inlineVolume: true,
        });

        resource.volume.setVolume(0.5);

        player.play(resource); // TODO: CALL NEW PLAY METHOD
      } else {
        server.queue.push({ video: path, title: fileName, isLocal: true });
      }
    }
  } catch (error) {
    console.error('ERROR OCCURED IN playAudioFile METHOD!', error);
  }
};

module.exports = {
  playCommand,
  stopCommand,
  queueCommand,
  pauseCommand,
  unpauseCommand,
  skipCommand,
  backCommand,
  searchCommand,
  playFileCommand,
};
