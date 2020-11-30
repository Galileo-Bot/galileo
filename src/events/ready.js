const Event = require('../entities/Event.js');
const Logger = require('../utils/Logger.js');
const StatsCommand = require('../commands/informations/stats.js');
const {formatDate} = require('../utils/FormatUtils.js');
const {randomActivities} = require('../constants.js');
const {random, readJSON} = require('../utils/Utils.js');

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

		const config = readJSON('./assets/jsons/config.json');
		if (config.statut === 'reboot') {
			if (client.channels.cache.has(config.cacheChannel)) client.channels.cache.get(config.cacheChannel).send('Relancement du bot fini.');
			else if (client.users.cache.has(config.cacheChannel)) client.users.cache.get(config.cacheChannel).send('Relancement du bot fini.');

			config.statut = 'started';
			config.cacheChannel = 'Aucun';
		}

		if (config.statut === 'maintenance') {
			await client.user.setPresence({
				status: 'dnd',
				activity: {
					name: '⚠️ En Maintenance.',
					type: 'WATCHING',
				},
			});
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
