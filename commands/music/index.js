const playCommand = async (interaction) => {
  const videoName = interaction.options.getString('video');
  const message = `Playing video: ${videoName}`;

  await interaction.reply(message);
};

module.exports = { playCommand };
