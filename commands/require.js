const fs = require('fs');

module.exports = {
	name: 'require',
	description: 'Requires a command',
	args: true,
	devOnly: true,
	usage: "<command>",
	type: 'owner',
	execute(message, args) {
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (command) {
			return message.channel.send(`There is already a command with name or alias \`${commandName}\`, ${message.author}!`);
		}

		message.reply("Loading...");

		const commandFolders = fs.readdirSync('./commands');
		const folderName = commandFolders.find(folder => fs.readdirSync(`./commands`).includes(`${commandName}.js`));

		try {
			const newCommand = require(`./${commandName}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send(`Command \`${newCommand.name}\` was loaded!`);
		} catch (error) {
			console.error(error);
			message.channel.send(`There was an error while loading a command \`${command.name}\`:\n\`${error.message}\``);
		}
	},
};