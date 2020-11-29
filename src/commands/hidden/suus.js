const {random} = require('../../utils/Utils.js');
const Command = require('../../entities/Command.js');
const Embed = require('../../utils/Embed.js');

module.exports = class SuusCommand extends Command {
	constructor() {
		super({
			name: 'suus',
			description: 'Jeej, jaaj. (affiche une image aléatoire de saucisse).',
			aliases: ['jeej', 'jaaj'],
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		const {sausages} = require('../../assets/jsons/data.json');
		const embed = Embed.fromTemplate('image', {
			client: this.client,
			image: Math.floor(Math.random() * 1000) === 666 ? 'https://cdn.discordapp.com/attachments/537627694788116490/547067318409363479/SPOILER_31Bx6VLvAqL.png' : random(sausages),
			description: 'Suus, jeej, jaaj.',
			title: 'Voici votre image de saucisse.',
		});

		await super.send(embed);
	}
};
