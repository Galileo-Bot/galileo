const {Collection} = require('discord.js');
const Logger = require('../utils/Logger.js');
const fs = require('fs');
const {sep} = require('path');

module.exports = class CommandManager {
	/**
	 * Les commandes.
	 * @type {Collection<string, Command>}
	 */
	static commands = new Collection();

	/**
	 * Cherche une commande via son nom.
	 * @param {string} name - Le nom de la commande.
	 * @returns {Command | undefined} - La commande trouvée.
	 */
	static findCommand(name) {
		return CommandManager.commands.find(c => c.name.toLowerCase() === name.toLowerCase() || c.aliases?.some(arg => arg.toLowerCase() === name.toLowerCase()));
	}

	/**
	 * Charge une commande.
	 * @param {Command} command - La commande à charger.
	 * @returns {void}
	 */
	loadCommand(command) {
		CommandManager.commands.set(command.name, command);
		Logger.log(`Commande '${command.name}' chargée.`, 'CommandManager');
	}

	/**
	 * Charge toutes les commandes dans le dossier en question.
	 * @param {string} dirName - Le nom du dossier.
	 * @returns {void}
	 */
	async loadCommands(dirName) {
		const path = `./${dirName}`;
		const commandDir = fs.readdirSync(path);
		Logger.info(`Recherche de commandes dans le dossier '${dirName}'.`, 'LoadingCommands');

		for (const commandFile of commandDir) {
			if (commandFile.endsWith('.js')) {
				const command = new (require(`../${path}/${commandFile}`))();
				if (command) {
					if (command.category === 'none') command.category = dirName.split(sep).pop();
					this.loadCommand(command);
				}
			} else {
				this.loadCommands(`${dirName}${sep}${commandFile}`);
			}
		}
	}

	/**
	 * Décharge une commande.
	 * @param {Command} command - La commande à décharger.
	 * @returns {void}
	 */
	unloadCommand(command) {
		CommandManager.commands.delete(command.name);
		Logger.log(`Commande '${command.name}' déchargée.`, 'CommandManager');
	}
};
