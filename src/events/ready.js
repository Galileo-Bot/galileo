const Event = require('../entities/Event.js');
const Logger = require('../utils/Logger.js');
const StatsCommand = require('../commands/informations/stats.js');
const {formatDate} = require('../utils/FormatUtils.js');
const {randomActivities} = require('../constants.js');
const {random} = require('../utils/Utils.js');

module.exports = class ReadyEvent extends Event {
	constructor() {
		super({
			name: 'ready',
			once: true,
		});
	}

	logInfosOfBot() {
		StatsCommand.getCPUUsage()
			.then(result => {
				Logger.warn(`RAM utilisée : ${StatsCommand.getProcessMemoryUsage()} MB`, 'ReadyEvent');
				Logger.warn(`Utilisation du processeur : ${result.percentage} %`, 'ReadyEvent');
			})
			.catch();
	}

	async run(client) {
		await super.run(client);

		this.setRandomPresence();
		setInterval(() => this.setRandomPresence(), 10 * 1000);

		client.dbManager.cache.ensure('status', 'starting');
		client.dbManager.cache.ensure('rebootingChannel', '');

		switch (client.dbManager.cache.get('status')) {
			case 'reboot':
				const rebootingChannel = client.dbManager.cache.get('rebootingChannel');
				if (client.channels.cache.has(rebootingChannel)) client.channels.cache.get(rebootingChannel).send('Relancement du bot fini.');
				else if (client.users.cache.has(rebootingChannel)) client.users.cache.get(rebootingChannel).send('Relancement du bot fini.');

				client.dbManager.cache.set('status', 'started');
				client.dbManager.cache.set('rebootingChannel', '');
				break;

			case 'maintenance':
				await client.user.setPresence({
					activity: {
						name: '⚠️ En Maintenance.',
						type: 'WATCHING',
					},
					status: 'dnd',
				});
				break;
		}

		Logger.info(`${client.user.username} (${client.user.id}) Est allumé ! Nombre de serveurs : ${client.guilds.cache.size}.`, 'ReadyEvent');

		this.logInfosOfBot();
		this.updateCommandsStats(client);

		setInterval(() => {
			this.logInfosOfBot();
			this.updateCommandsStats(client);
		}, 20 * 60 * 1000);
	}

	/**
	 * Met une présence  au botaléatoire parmis celles dans le fichier JSON.
	 * @returns {void}
	 */
	setRandomPresence() {
		this.client.user.setPresence({
			activity: {
				name: random(randomActivities),
				type: 'STREAMING',
				url: 'https://www.twitch.tv/Terracid',
			},
			status: 'dnd',
		});
	}

	/**
	 * Met à jour le JSON contenant les utilisations de commandes.
	 * @returns {void}
	 */
	updateCommandsStats(client) {
		const formattedDate = formatDate('dd/MM/yyyy');

		if (!client.dbManager.messages.has('today') || client.dbManager.messages.get('today').length === 0) client.dbManager.messages.set('today', formattedDate);
		if (!client.dbManager.messages.has('stats')) client.dbManager.messages.set('stats', new Array(30).fill(0));
		if (client.dbManager.messages.get('today') !== formattedDate) {
			client.dbManager.messages.set('today', formattedDate);
			const stats = client.dbManager.messages.get('stats');
			stats.shift();
			client.dbManager.messages.set('stats', stats);
			client.dbManager.messages.push('stats', 0);
		}
	}
};
