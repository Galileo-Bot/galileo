const {MessageEmbed} = require('discord.js');
const {argTypes} = require('../../constants.js');
const {getArg} = require('../../utils/ArgUtils.js');
const {parseDate} = require('../../utils/FormatUtils.js');
const Command = require('../../entities/Command.js');

module.exports = class ChannelInfoCommand extends Command {
	constructor() {
		super({
			name: 'channelinfo',
			description: "Permet d'avoir des informations sur un salon.",
			usage: 'channelinfo <ID/Nom/Mention de salon>\nchannelinfo',
			aliases: ['ci', 'channel-info', 'saloninfo'],
		});
	}

	async run(client, message, args) {
		super.run(client, message, args);

		const embed = new MessageEmbed();
		let topic = 'Aucun.';
		let type = 'Textuel';
		let channel = message.channel;

		try {
			channel = getArg(message, 1, argTypes.channel);
		} catch (ignored) {}

		if (channel.type === 'voice') {
			type = 'Vocal';
		} else if (channel.type === 'category') {
			type = 'Catégorie';
		} else if (channel.type === 'news') {
			type = 'Annonces';
		} else if (channel.type === 'store') {
			type = 'Shopping';
		} else if (channel.topic?.length > 0) {
			topic = channel.topic;
		}

		embed.setTimestamp();
		embed.setFooter(client.user.username, client.user.displayAvatarURL());
		embed.setAuthor(`Informations sur le salon : ${channel.name}`, message.guild.iconURL());
		embed.addField('🆔 ID :', channel.id, true);
		embed.addField('<:textuel:635159053630308391> Nom :', channel.name, true);
		embed.addField('<:blocnote:613703973345689610> Date de création :', parseDate('dd/MM/yyyy hh:mm', channel.createdAt), true);
		embed.addField('<:category:635159053298958366> Type de salon :', type, true);
		if (type === 'Textuel') embed.addField('<a:cecia:635159108080631854> Sujet :', topic, true);

		embed.setColor('#4b5afd');
		await super.send(embed);
	}
};
