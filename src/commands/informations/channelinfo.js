const {ARG_TYPES} = require('../../constants.js');
const {getArg} = require('../../utils/ArgUtils.js');
const Command = require('../../entities/Command.js');
const dayjs = require('dayjs');
const {BetterEmbed} = require('discord.js-better-embed');

module.exports = class ChannelInfoCommand extends Command {
	constructor() {
		super({
			aliases: ['ci', 'channel-info', 'saloninfo'],
			description: "Permet d'avoir des informations sur un salon.",
			name: 'channelinfo',
			usage: 'channelinfo <ID/Nom/Mention de salon>\nchannelinfo',
		});
	}

	async run(client, message, args) {
		await super.run(client, message, args);

		const channel = getArg(message, 1, ARG_TYPES.CHANNEL) ?? message.channel;
		let topic = 'Aucun.';
		let type = 'Textuel';
		switch (channel.type) {
			case 'voice':
				type = 'Vocal';
				break;
			case 'category':
				type = 'Catégorie';
				break;
			case 'news':
				type = 'Annonces';
				break;
			case 'store':
				type = 'Shopping';
				break;
		}

		if (channel.topic?.length > 0) topic = channel.topic;

		const embed = BetterEmbed.fromTemplate('basic', {
			client,
		});
		embed.setAuthor(`Informations sur le salon : ${channel.name}`, message.guild.iconURL({
			dynamic: true
		}));
		embed.setColor('#4b5afd');
		embed.addField('🆔 ID :', channel.id, true);
		embed.addField('<:textuel:635159053630308391> Nom :', channel.name, true);
		embed.addField('<:bnote:635163385645760523> Date de création :', dayjs(channel.createdAt).format('DD/MM/YYYY hh:mm'), true);
		embed.addField('<:category:635159053298958366> Type de salon :', type, true);
		if (type === 'Textuel') embed.addField('<a:cecia:635159108080631854> Sujet :', topic, true);

		await super.send(embed);
	}
};
