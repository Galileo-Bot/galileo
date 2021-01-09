const SlowCommand = require('../../entities/custom_commands/SlowCommand.js');
const Logger = require('../../utils/Logger.js');
const imgur = require('imgur');
const {BetterEmbed} = require('discord.js-better-embed');
const {exec} = require('child_process');

module.exports = class CommandStatsCommand extends SlowCommand {
	constructor() {
		super({
			aliases: ['cs', 'sm', 'statsmessages'],
			description: "Permet d'avoir des statistiques sur le nombre de commandes utilisées par le bot durant les 30 derniers jours.",
			name: 'commandstats',
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		await super.startWait();
		try {
			exec('py assets/generateGraph.py');
			exec('python3 assets/generateGraph.py');
		} catch (ignored) {}

		imgur
			.uploadFile('./assets/images/graphMessages.png')
			.then(async json => {
				const embed = BetterEmbed.fromTemplate('image', {
					client,
					description: '',
					image: json.data.link,
					title: "Statistiques sur l'utilisation du bot.",
				});

				await super.send(embed);
				await super.stopWait();
			})
			.catch(e => Logger.error(e.stack));
	}
};
