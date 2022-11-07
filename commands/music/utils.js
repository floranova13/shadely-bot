/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const {
  getAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const fs = require('fs');

const joinVoice = async (Guild, Member, player) => {
  const voiceChannelId = Member.voice.channel.id;

  if (getVoiceConnection(Guild.id)) {
    console.error('There is already a voice connection!');
    return;
  }

  await joinVoiceChannel({
    channelId: voiceChannelId,
    guildId: Guild.id,
    adapterCreator: Guild.voiceAdapterCreator,
  });

  const connection = await getVoiceConnection(Guild.id);
  connection.subscribe(player);
};

const createPlayer = (server, Guild) => {
  const { queue, player } = server;

  if (!player) {
    server.player = createAudioPlayer();
  }
};

const getOrCreateVoiceConnection = async (Guild, Member, player, server) => {
  let connection = await getVoiceConnection(Guild.id);
  const voiceChannelId = Member.voice.channel.id;

  // make sure bot is in voice
  if (!connection) {
    await joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: Guild.id,
      adapterCreator: Guild.voiceAdapterCreator,
    });

    connection = await getVoiceConnection(Guild.id);
    await connection.subscribe(player);
    await startPlayerListener(Guild, server, connection);
  }

  return connection;
};

const playAudio = async (Guild, Channel, server, connection) => {
  const { queue, oldQueue, player } = server;
  const resource = getNextResource(queue[0]);
  console.log('starting to play audio');


  resource.volume.setVolume(0.5);
  console.log('Playing audio');
  player.play(resource);
  server.current = queue[0];
  await Channel.send(`Playing ${queue[0].title}`);
  oldQueue.push(queue.shift());
};

const startPlayerListener = (Guild, server, connection) => {
  const { queue, oldQueue, player } = server;

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('Idling');
    server.current = null;
    // is there anything in the queue?
    queue.length
      ? playAudio(Guild, queue, player)
      : () => {
          if (connection) connection.destroy();
        };
  });
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
    const { queue } = server;
    let { player } = server;

    if (!Member.voice.channel) {
      return Channel.send('You must be in a voice channel to play a video!');
    } else {
      if (!player) {
        await createPlayer(server, Guild);
        player = server.player;
      }

      // make sure bot is in voice
      if (!getVoiceConnection(Guild.id)) {
        await joinVoice(Guild, Member, player);
      }

      await Channel.send(`Queuing: ${fileName}`);
      queue.push({ video: path, title: fileName, isLocal: true });

      const connection = await getOrCreateVoiceConnection(
        Guild,
        Member,
        player,
        server
      );

      // check if audio is playing or queued
      if (
        player._state.status !== AudioPlayerStatus.Playing &&
        player._state.status !== AudioPlayerStatus.Paused
      ) {
        playAudio(Guild, Channel, server, connection);
      }
    }
  } catch (error) {
    console.error('ERROR OCCURED IN playAudioFile METHOD!', error);
  }
};

const getNextResource = async (queueItem) => {
  let resource;
  console.log('starting to play audio');

  if (queueItem.isLocal) {
    resource = await createAudioResource(queueItem.video, {
      inlineVolume: true,
    });
  } else {
    resource = await createAudioResource(
      ytdl(queueItem.video, { filter: 'audioonly' }),
      { inlineVolume: true }
    );
  }

  return resource;
};

module.exports = {
  joinVoice,
  createPlayer,
  getOrCreateVoiceConnection,
  playAudio,
  startPlayerListener,
  downloadFile,
  playAudioFile,
  getNextResource,
};
