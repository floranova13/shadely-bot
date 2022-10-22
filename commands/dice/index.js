const _ = require('lodash');

const rollCommand = async (interaction) => {
  const roll = _.random(1, interaction.options.getInteger('die'));
  const message = `Rolled: ${roll}`;

  await interaction.reply(message);
};

module.exports = { rollCommand };
