const Command = require('../entities/Command.js');

module.exports = class SlowCommand extends Command {
	waitEmoji;

	constructor(options) {
		super(options);
	}

	async run(client, message, args) {
		await super.run(client, message, args);
		this.waitEmoji = this.message.client.emojis.resolve('638831506126536718');
	}

	async startWait() {
		await this.message.react(this.waitEmoji);
	}

	async stopWait() {
		await this.message.reactions.cache.find(reaction => reaction.emoji === this.waitEmoji).users.remove(this.message.client.user.id);
	}
};
