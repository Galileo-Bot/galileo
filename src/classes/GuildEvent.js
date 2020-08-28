const Logger = require('../utils/Logger.js');
const Event = require('../entities/Event.js');
const {sendLogMessage} = require('../utils/Utils.js');
const {MessageEmbed} = require('discord.js');

module.exports = class GuildEvent extends Event {
	/**
	 * Représente un type de GuildEvent :
	 * * **`add`** - Le bot a rejoint un serveur.
	 * * **`remove`** - Le bot a quitté un serveur.
	 * @typedef {string} GuildEventType
	 */
	
	guild;
	/**
	 * @type GuildEventType
	 */
	type;
	
	
	/**
	 * @param {GuildEventOptions} options
	 */
	constructor(options) {
		super(options);
		this.type = options.type;
	}
	
	
	/**
	 * @param {GaliClient} client
	 * @param {Guild} guild
	 * @returns {Promise<void>}
	 */
	async run(client, guild) {
		await super.run(client);
		this.guild = guild;
	}
	
	/**
	 * Renvoie l'Embed d'un GuildEvent.
	 * @returns {Embed} - L'embed.
	 */
	embed() {
		if (!this.guild.available) return;
		
		const embed = new MessageEmbed();
		embed.setTitle(`Le bot a ${this.type === 'remove' ? 'quitté' : 'rejoint'} un serveur.`);
		embed.setThumbnail(this.guild.iconURL());
		embed.setDescription(`**${this.guild.name}** (\`${this.guild.id}\`)`);
		embed.addField('Créateur :', `${this.guild.owner.user} (\`${this.guild.owner.user.id}\`)`);
		embed.addField('Nombre de membres :', `**$this.{guild.memberCount}** dont **${this.guild.members.cache.filter((m) => m.user.bot).size}** bots.`);
		embed.setColor('#dd2211');
		embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL());
		embed.setTimestamp();
		
		return embed;
	}
	
	
	/**
	 * Log l'évent.
	 * @returns {void}
	 */
	log() {
		if (!this.guild.available) return;
		
		Logger.info(`Le bot a ${this.type === 'remove'
								? 'quitté'
								: 'rejoint'} le serveur '${this.guild.name}' (${this.guild.id}), owner : ${this.guild.owner.user.tag} (${this.guild.owner.id})
Nombre de serveurs actuel : ${this.client.guilds.cache.size}`, `Guild${this.type[0].toUpperCase() + this.type.slice(1)}Event`);
	}
};
