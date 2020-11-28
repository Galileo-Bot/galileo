const Command = require('../../entities/Command.js');
const Embed = require('../../utils/Embed.js');
const {argTypes, channels} = require('../../constants.js');
const {getArg} = require('../../utils/ArgUtils.js');

module.exports = class BugsCommand extends Command {
	constructor() {
		super({
			name: 'bugs',
			description: "Permet d'avoir la liste des bugs existants ou des informations sur un bug.",
			aliases: ['bug', 'buglist', 'buginfo'],
			usage: "bugs [Numéro d'un bug]",
		});
	}

	/**
	 * Retourne un bug en le cherchant dans le salon des bugs.
	 * @param {number | null} bugNumber - Le numéro du bug.
	 * @param {{number: number, content: string, since: Date}[]} messages - Les messages dans lesquels rechercher le bug.
	 * @param {Embed} embed - L'embed.
	 * @returns {string} - L'embed.
	 */
	getBugOrBugs(bugNumber, messages, embed) {
		let description;
		if (bugNumber) {
			const bug = messages.find(msg => msg.number === bugNumber);
			if (!bug) return this.getBugOrBugs(null, messages, embed);

			description = bug.content;
			embed.setTitle(`Informations sur le bug numéro ${bug.number}:`);
			embed.addField('Présent depuis : ', `${Math.round((Date.now() - bug.since.getTime()) / (1000 * 60 * 60 * 24))} jours.`);
		} else {
			embed.setTitle('Liste des bugs existants :');
			messages = messages.sort((a, b) => a.number - b.number);
			description = messages.map(message => message.content).join('\n\n');
		}

		return description ?? "Aucun bug n'a été trouvé.";
	}

	async run(client, message, args) {
		super.run(client, message, args);

		const bugNumber = getArg(message, 1, argTypes.number);
		const channelBugs = client.channels.cache.get(channels.bugChannel);
		if (!client.channels.cache.has(channelBugs.id)) {
			return super.send("Le bot n'a pas le salon bugs dans ses salon, contactez un créateur pour en savoir plus.");
		}

		const messages = (await channelBugs.messages.fetch())
			.filter(m => m.content.includes('<:non:515670765820182528>'))
			.map(msg => ({
				content: msg.content,
				number: parseInt(msg.content.replace(/.+[*]{0,2}g\.(\d+)[*]{0,2}/, '$1')),
				since: msg.createdAt,
			}));

		const embed = Embed.fromTemplate('complete', {
			client,
		});
		const description = this.getBugOrBugs(bugNumber, messages, embed);
		embed.setDescription(description);
		await super.send(embed);
	}
};
