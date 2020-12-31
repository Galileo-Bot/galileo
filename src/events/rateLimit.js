const {formatWithRange} = require('../utils/FormatUtils.js');
const CommandManager = require('../entities/CommandManager.js');
const Logger = require('../utils/Logger.js');
const Event = require('../entities/Event.js');
const {BetterEmbed} = require('discord.js-better-embed');
const {getPrefixFromMessage, sendLogMessage} = require('../utils/Utils.js');

module.exports = class RateLimitEvent extends Event {
	constructor() {
		super({
			name: 'rateLimit',
		});
	}

	/**
	 * Runned when event is emmited.
	 * @param {GaliClient} client - Le client.
	 * @param {module:"discord.js".RateLimitData} rateLimitInfo
	 * @returns {Promise<void>} - Nothing.
	 */
	async run(client, rateLimitInfo) {
		await super.run();
		if (rateLimitInfo.timeout < 7000) return;

		Logger.warn(`RateLimit : ${rateLimitInfo.path}`);
		const routes = rateLimitInfo.path.split(/\//g).filter(i => i);
		const channel = client.channels.cache.get(routes[1]) ?? null;
		const message = (await channel?.fetch())?.messages.cache.get(routes[3]) ?? null;

		const informations = message ? `[Message](${message.url})\nChannel : ${channel}\`#${channel.name}\`(\`${channel.id}\`)` : null;

		const embed = BetterEmbed.fromTemplate('author', {
			client,
			author: `Rate limit :`,
			authorURL:
				message.guild.iconURL({
					dynamic: true,
				}) ??
				client.user.displayAvatarURL({
					dynamic: true,
				}),
			description: `Le bot est en rate limit sur la route : \`\`\`js\n${rateLimitInfo.route}\`\`\`\nAvec le chemin : \`\`\`js\n${decodeURI(rateLimitInfo.path)}\`\`\``,
		});

		if (informations) {
			embed.addField('Informations : ', informations);
			if (message && !message.deleted)
				embed.addField('Commande :', CommandManager.findCommand(message.content.slice(getPrefixFromMessage(message).length).trim().toLowerCase().split(/\s+?/gi)[0]).name);
			embed.addField('Message :', formatWithRange(message.content, 1024));
		}

		await sendLogMessage(client, 'rateLimit', embed);
	}
};
