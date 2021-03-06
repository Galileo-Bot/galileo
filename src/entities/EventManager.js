const {Collection} = require('discord.js');
const Logger = require('../utils/Logger.js');
const fs = require('fs');

module.exports = class EventManager {
	/**
	 * Les évènements.
	 * @type {module:"discord.js".Collection<string, Event>}
	 */
	static events = new Collection();
	client;

	constructor(client) {
		this.client = client;
	}

	/**
	 * Charge un évènement.
	 * @param {import("../../index.d.ts").Event} event - L'évènement à charger.
	 * @returns {void}
	 */
	bind(event) {
		EventManager.events.set(event.name, event);
		if (event.once) this.client.once(event.name, (...args) => event.run(this.client, ...args));
		else this.client.on(event.name, (...args) => event.run(this.client, ...args));
		Logger.log(`Évènement '${event.name}' chargé..`, 'EventManager');
	}

	/**
	 * Charge tous les évènements dans le dossier en question.
	 * @param {string} dirName - Le nom du dossier.
	 * @returns {void}
	 */
	loadEvents(dirName) {
		const path = `./${dirName}`;
		const eventDir = fs.readdirSync(path);
		Logger.info(`Chargement des évènements dans le dossier '${dirName}'.`, 'LoadingEvents');

		for (const eventFile of eventDir) {
			const event = new (require(`../${dirName}/${eventFile}`))();
			if (event) this.bind(event);
		}
	}

	/**
	 * Décharge un évènement.
	 * @param {import("../../index.d.ts").Event} event - L'évènement à décharger.
	 * @returns {void}
	 */
	unbind(event) {
		EventManager.events.delete(event.name);
		this.client.removeAllListeners(event.name);
		Logger.log(`Évènement '${event.name}' déchargé.`, 'EventManager');
	}
};
