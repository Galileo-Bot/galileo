const SanctionCommand = require('../../entities/custom_commands/SanctionCommand.js');
const {TAGS} = require('../../constants.js');

module.exports = class BanCommand extends SanctionCommand {
	constructor() {
		super({
			aliases: ['tempban', 'tempb', 'bantemp'],
			clientPermissions: ['BAN_MEMBERS'],
			description: 'Permet de bannir un membre du serveur définitivement avec potentiellement une raison.',
			name: 'ban',
			tags: [TAGS.GUILD_ONLY],
			type: 'ban',
			usage: "ban <ID/Nom/Mention d'un membre> [raison]\nban <ID/NOM/Mention d'un membre> <Temps> (ex: 2d, 5h) [Raison]",
			userPermissions: ['KICK_MEMBERS', 'BAN_MEMBERS'],
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);
		const person = super.getPerson(message);
		if (!person) return;

		const reason = await super.createSanction(person);
		await super.applySanction(person, reason);
	}
};
