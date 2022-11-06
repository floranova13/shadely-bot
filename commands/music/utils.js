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
  let resource;
  console.log('starting to play audio');

  if (queue[0].isLocal) {
    resource = await createAudioResource(queue[0].video, {
      inlineVolume: true,
    });
  } else {
    resource = await createAudioResource(
      ytdl(queue[0].video, { filter: 'audioonly' }),
      { inlineVolume: true }
    );
  }

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
    // is there anything in the queue?
    queue.length
      ? playAudio(Guild, queue, player)
      : () => {
          if (connection) connection.destroy();
        };
  });
};

module.exports = {
  joinVoice,
  createPlayer,
  getOrCreateVoiceConnection,
  playAudio,
  startPlayerListener,
};
