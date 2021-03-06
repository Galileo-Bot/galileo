const Command = require('../../entities/Command.js');
const {argError} = require('../../utils/Errors.js');

module.exports = class DevineCommand extends Command {
	constructor() {
		super({
			aliases: ['dv', 'guess'],
			description: 'Donne une réponse aux questions simples (oui/non), attention : non fiable à 100%.',
			name: 'devine',
			usage: 'devine <texte> ?',
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		const {guess} = require('../../assets/jsons/data.json');
		const fullText = args.join(' ');
		if (args.length === 0) return argError(message, this, '<a:attention:613714368647135245> **Veuillez mettre une question.**');
		if (fullText === '?') return argError(message, this, '<a:attention:613714368647135245> **Une question ne contient pas qu’un `?` <:smart_guy:547576698833600522>**');
		if (!fullText.includes('?')) return argError(message, this, '<a:attention:613714368647135245> **Une question se termine par un `?`.**');

		return super.send(`**${message.author.username}**, ${guess[Math.floor(Math.random() * guess.length)]}`);
	}
};
