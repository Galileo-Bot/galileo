const Command = require('../../entities/Command.js');
const {BetterEmbed} = require('discord.js-better-embed');

module.exports = class PingCommand extends Command {
	constructor() {
		super({
			description: "Permet de connaître le ping du bot de l'API.",
			name: 'ping',
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		const m = await super.send('Ping :thinking: ?');
		const embed = BetterEmbed.fromTemplate('basic', {
			client,
		});

		embed.setColor('#36393e');
		embed.setTitle('🏓 Pong !');
		embed.setThumbnail(client.user.avatarURL());
		embed.addField('🤖 Latence du bot', `${m.createdTimestamp - message.createdTimestamp} ms`, true);
		embed.addField("📡 Latence de l'API :", `${Math.round(client.ws.ping)} ms`, true);

		await m.edit(embed);
	}
};
