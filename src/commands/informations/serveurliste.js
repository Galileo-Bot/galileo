const {BetterEmbed} = require('discord.js-better-embed');
const Logger = require('../../utils/Logger.js');
const {ARG_TYPES} = require('../../constants.js');
const {getArg} = require('../../utils/ArgUtils.js');
const Command = require('../../entities/Command.js');

module.exports = class ServeurListeCommand extends Command {
	constructor() {
		super({
			aliases: ['serverlist', 'sl', 'servlist'],
			description: 'Affiche la liste des serveurs en rangeant de façon décroissante des membres et à la page 1 ou celle inscrite.',
			name: 'serveurliste',
			usage: 'serveurliste <nombre>\nserveurliste',
		});
	}

	/**
	 * Créé la page suivant le nombre.
	 * @param {number} pageNumber - Le numéro de la page à générer.
	 * @returns {BetterEmbed} - L'embed de retour.
	 */
	createPage(pageNumber) {
		/**
		 * @type {number}
		 */
		const pageNumberArg = getArg(this.message, 1, ARG_TYPES.NUMBER);
		const pageMax = Math.ceil(this.client.guilds.cache.size / 20);
		let page = pageNumber;
		if (!pageNumber && (!pageNumberArg || pageNumberArg > pageMax || pageNumberArg < 1)) page = pageMax;

		const embedDesc = this.client.guilds.cache
			.sort((a, b) => b.memberCount - a.memberCount)
			.map(guild => `**${guild.name}**\t|\t**${guild.memberCount}** membres (**${guild.members.cache.filter(m => m.user.bot).size}** bots)`)
			.slice(pageNumber * 20 - 20, page * 20)
			.join('\n');

		return BetterEmbed.fromTemplate('title', {
			client: this.client,
			description: `Nombre de serveurs : ${this.client.guilds.cache.size}.\n\n${embedDesc}`,
			title: `Liste des serveurs de ${page * 20 - 19} à ${page * 20}`,
		}).setFooter(`${this.client.user.username} • Page ${page}/${pageMax}`, this.client.user.displayAvatarURL());
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		let p = args.length > 0 ? args[0] : 1;
		const sl = await super.send(this.createPage(p)).catch(err => Logger.error(err));
		if (client.guilds.cache.size > 20) {
			await sl.react('◀');
			await sl.react('▶');

			const slEvent = sl.createReactionCollector((reaction, user) => user.id === message.author.id);
			slEvent.on('collect', async (reaction, user) => {
				if (user.bot) return;
				switch (reaction.emoji.name) {
					case '◀':
						p--;
						if (p < 0 || !p) p = 0;
						await sl.reactions.cache.find(r => r.emoji.name === reaction.emoji.name).users.remove(message.author.id);
						return sl.edit(this.createPage(p));

					case '▶':
						p++;
						if (!p || p > Math.round(client.guilds.cache.size / 20)) p = 0;
						await sl.reactions.cache.find(r => r.emoji.name === reaction.emoji.name).users.remove(message.author.id);
						return sl.edit(this.createPage(p));
				}
			});
		}
	}
};
