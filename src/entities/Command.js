const Embed = require('../utils/Embed.js');
const {formatWithRange} = require('../utils/FormatUtils.js');
const {sendLogMessage} = require('../utils/Utils.js');

module.exports = class Command {
	aliases;
	args = [];
	category;
	client;
	clientPermissions;
	cooldown;
	description;
	message;
	name;
	tags;
	usage;
	userPermissions;

	/**
	 * Créé une nouvelle commande.
	 * @param {CommandOptions} options - Les options de la commande.
	 */
	constructor(options) {
		this.aliases = options?.aliases ?? [];
		this.category = options?.category ?? 'none';
		this.clientPermissions = options?.clientPermissions ?? [];
		this.cooldown = options?.cooldown ?? 0;
		this.description = options?.description ?? '';
		this.name = options.name;
		this.tags = options?.tags ?? [];
		this.usage = options?.usage ?? '';
		this.userPermissions = options?.userPermissions ?? [];
	}

	/**
	 * Fonction exécutée quand la commande est exécutée.
	 * @param {GaliClient} client - Le client.
	 * @param {Message} message - Le message.
	 * @param {string[]} [args = []] - Les arguments.
	 * @returns {Promise<void>} - N'importe.
	 */
	async run(client, message, args = []) {
		this.client = client;
		this.message = message;
		this.args = args;

		const embed = Embed.fromTemplate('author', {
			client,
			author: `La commande ${this.name} a été exécutée :`,
			authorURL: message.author.displayAvatarURL({
				dynamic: true,
			}),
			description: `Envoyé ${message.guild ? `sur : **${message.guild.name}** (\`${message.guild.id}\`)\nDans : ${message.channel} (\`${message.channel.id}\`)` : 'en privé'}\nEnvoyé par : ${
				message.author
			} (\`${message.author.id}\`)`,
		});
		embed.addField('Message :', formatWithRange(message.content, 1024));
		embed.setColor('RANDOM');

		if (message.attachments.array()[0]?.height) embed.setImage(message.attachments.array()[0].url);
		if (!embed.image && message.embeds[0]?.image?.height) embed.setImage(message.embeds[0].image.url);
		if (message.guild) embed.setThumbnail(message.guild.iconURL());

		await sendLogMessage(client, 'command', embed);
	}

	/**
	 * Envoie un message.
	 * @param {StringResolvable | APIMessage} [content=''] - Le contenu à envoyer.
	 * @param {MessageOptions | MessageAdditions} [options={}] - Les options à fournir.
	 * @returns {Promise<Message>} - Le résultat du message.
	 */
	async send(content, options) {
		if (
			this.message.guild &&
			!this.message.guild?.members.cache
				.filter(m => this.message.guild.ownerID !== m.user.id && !m.user.bot && m.permissions.has('ADMINISTRATOR'))
				?.map(m => m.user.id)
				.includes(this.message.author.id)
		) {
			if (typeof content !== 'string') {
				options = content;
				content = '';
			}

			options = Object.assign(options ?? {}, {
				disableMentions: 'everyone',
			});

			return await this.message.channel?.send(content, options);
		}

		return await this.message.channel?.send(content, options);
	}
};
