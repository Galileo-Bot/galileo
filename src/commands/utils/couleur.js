const Jimp = require('jimp');
const Command = require('../../entities/Command.js');
const {BetterEmbed} = require('discord.js-better-embed');
const {argError} = require('../../utils/Errors.js');
const {random} = require('../../utils/Utils.js');
const {colors} = require('../../assets/jsons/data.json');

module.exports = class CouleurCommand extends Command {
	constructor() {
		super({
			aliases: ['color'],
			description: "Permet de générer ou de voir la couleur d'un code hexadécimale.",
			name: 'couleur',
			usage: 'couleur <couleur hexadécimale>\ncouleur random',
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		const hexColors = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
		const embed = BetterEmbed.fromTemplate('basic', {
			client,
		});
		let color = '';
		let image = null;

		if (args[0] === 'random' || args.length === 0) {
			color = '#';
			for (let i = 0; i <= 5; i++) {
				color += random(hexColors);
			}
		} else {
			for (const property in colors) {
				if (Object.prototype.hasOwnProperty.call(colors, property) && colors[property].includes(args[0].toLowerCase())) {
					color = property;
					break;
				}
			}

			if (color !== args[0]) {
				if ((args[0].startsWith('#') && args[0].length === 7) || !isNaN(parseInt(args[0]))) {
					if (args[0].startsWith('#')) args[0] = args[0].substring(1);
					if (args[0].length !== 6 || [...args[0]].some(c => !hexColors.includes(c.toLowerCase())))
						return argError(message, this, 'Veuillez mettre une couleur hexadécimale valable.');
					color = `#${args[0]}`;
				}

				if (color.length === 0) return argError(message, this, "Veuillez mettre une couleur hexadécimale valable ou le nom d'une couleur valable ou `random`.");
			}
		}

		do {
			image = new Jimp(256, 128, color);
			await image.write('./assets/images/color.png', err => {
				if (err) console.error(err);
			});
		} while (!image);

		embed.setTitle(`Couleur : ${color}`);
		embed.setColor(color);

		setTimeout(async () => {
			embed.attachFiles(['./assets/images/color.png']);
			await super.send(embed);
		}, 500);
	}
};
