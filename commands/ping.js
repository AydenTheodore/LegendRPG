const { usersFile, prefix } = require('../config.json');
const users = require(`../${usersFile}`);

module.exports = {
	name: "ping",
	description: "Pong!",
	aliases: ['pong'],
	type: 'generic',
	execute(message, args) {
		if (args[0] === '-dev') {
			if (!users[message.author.id].dev) {
				users[message.author.id].dev = true;
			} else users[message.author.id].dev = false;

			message.delete();
		} else {
			const pingu = message.content === `${prefix}ping` ? "Pong!" : "Ping!";
			const client = message.client;

			message.channel.send("Pinging...").then(msg => {
				msg.edit(`🏓 | ${pingu}\n\n**Latency:** ${msg.createdTimestamp - message.createdTimestamp}ms.\n**API Latency:** ${Math.round(client.ws.ping)}ms`).then(msg => {
					const filter = (reaction, user) => reaction.emoji.name === "⏰" && user.id == message.author.id;

					let collector = msg.createReactionCollector(filter, { time: 15000 });
					collector.on('collect', (reaction, collector) => {
						console.log('got a reaction');
					});
					collector.on('end', collected => {
						console.log(`collected ${collected.size} reactions`);
					});

					msg.react("⏰");
				});
			});
		}
	},
};