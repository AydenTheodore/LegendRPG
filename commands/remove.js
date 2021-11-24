const fs = require('fs');

module.exports = {
	name: 'remove',
	description: 'Removes a command',
	args: true,
	devOnly: true,
	usage: "<command>",
	type: 'owner',
	execute(message, args) {
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) {
			return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);
		}

		message.reply("Removing...");

		const commandFolders = fs.readdirSync('./commands');
		const folderName = commandFolders.find(folder => fs.readdirSync(`./commands`).includes(`${commandName}.js`));

		try {
			const oldCmd = command.name;
			message.client.commands.delete(command.name);

			message.channel.send(`Command \`${oldCmd}\` was removed!`);
		} catch (error) {
			console.error(error);
			message.channel.send(`There was an error while removing the command \`${command.name}\`:\n\`${error.message}\``);
		}
	},
};