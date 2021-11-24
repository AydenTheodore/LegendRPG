const Discord = require('discord.js');
const fs = require('fs');
const { usersFile } = require('./config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const users = require(`./${usersFile}`);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let loaded = 0, errors = 0, total = 0;
for (var file = 0; file < commandFiles.length; file++) {
	try {
		const command = require(`./commands/${commandFiles[file]}`);
		// set a new item in the Collection
		// with the key as the command name and the value as the exported module
		client.commands.set(command.name, command);

		loaded++;
		console.log(`${command.name} loaded!`);
	} catch (err) {
		errors++;

		console.error(err);
	}

	total++;
}

const status = ["online", "offline", "idle", "dnd"];
const ran = Math.floor(Math.random() * status.length);

const texts = [['vocês owo', 'WATCHING'], ['Terraria', 'PLAYING'], ['Never Gonna Give You Up', 'LISTENING'], ['😭 Volta The Owl House', 'WATCHING'], ['Contando seu dinheiro', 'WATCHING'], ['SEJ-DOFL', 'PLAYING']];
const dom = Math.floor(Math.random() * texts.length);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!\nLoaded ${loaded}/${total} commands (${errors} errors)`);

	function setStatus() {
		client.user.setPresence({
            activity: { 
                name: texts[dom][0],
                type: texts[dom][1]
            },
            status: status[ran]
        });
	}

	setStatus();
	setInterval(setStatus, 3600000);
});

setInterval(function() {
	fs.writeFile(`${usersFile}.bak`, JSON.stringify(users), (err) => {
		if (err) {
			console.error(err);
			return console.log("[RPG] - Backup failed to save.");
		}
	});
	console.log("[RPG] - Backup sucessfully saved.");
}, 10800 * 1000);

setInterval(function() {
	fs.writeFile(usersFile, JSON.stringify(users), (err) => {
		if (err) console.error(err);
	});
}, 600 * 1000)

function random(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

/*
client.on('interactionCreate', message => {
	if (message.content.includes(process.env.TOKEN) || message.content.includes('--tokenwarn')) {
		message.delete();
		if (!message.author.bot) message.author.send("Hey, você não pode ficar vazando meu TOKEN por aí!");
		return;
	}

	if (message.author.bot) return;

	if (message.content === "<@718176833102807041>" || message.content === "<@!718176833102807041>") {
		const embed = new Discord.MessageEmbed()
			.setAuthor(client.user.tag, client.user.displayAvatarURL())
			.setDescription(`Olá ${message.author}, eu sou **${client.user.username}**, um pequeno RPG no Discord.\n\nPrefixo atual: \`>\`, \`<\` ou \`=\`.`)
			.setThumbnail(client.user.displayAvatarURL())
			.setColor("#9badb4")
			.setTimestamp()
			.setFooter(`Mande uma DM em caso de dúvidas!`);

		return message.channel.send(embed);
	}

	if (message.channel.type === "dm") {
		const owner = client.users.cache.get(process.env.OWNER_ID);
		const dev = client.users.cache.get(process.env.DEV_ID);

		const msgEmbed = new Discord.MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setDescription(message.content)
			.setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setColor("#4A75AF")
			.setTimestamp()
			.setFooter("Enviado dia");

		if (message.author.id !== owner.id) {
			owner.send(msgEmbed);
		} else {
			dev.send(msgEmbed);
		}
	}

	if (users[message.author.id]) {
		if ((message.author.id === process.env.OWNER_ID || message.author.id === process.env.DEV_ID) && users[message.author.id].perms < 5) {
			users[message.author.id].perms = 5;

			console.log(`[101] Raised ${message.author.username}'s permissions to 5`);
		}
		
		try {
			const user = users[message.author.id][users[message.author.id].current];

			if (user.hp < user.maxHP && !user.fighting) {
				if (Math.random() > 0.5) user.hp += random(user.maxHP / 20, user.maxHP / 15);
			}
			
			if (user.mana < user.maxMana && !user.fighting) {
				if (Math.random() > 0.5) user.mana += random(user.maxMana / 20, user.maxMana / 15);
			}
			
			if (user.hp > user.maxHP) user.hp = user.maxHP;
			if (user.mana > user.maxMana) user.mana = user.maxMana;

			const coins = Math.floor(Math.random() * 3);
			if (halloween || christmas) {
				if (!users[message.author.id].candies) users[message.author.id].candies = 0;

				users[message.author.id].candies += Math.floor(Math.random() * 3);
			}

			users[message.author.id].cash += coins;

			const gem = Math.random();
			if (gem < 0.001) {
				users[message.author.id].gems += 1;
				message.react("✨");
			}
		} catch (err) {
			console.error(err);
		}
	}

  	const prefixChar = prefixes.find(p => message.content.startsWith(p));
	const prefixMention = new RegExp(`^<@!?${client.user.id}> `);

    const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : prefixChar;

  	if (!prefix) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command && !users[message.author.id]) return message.reply("Registre-se com com `register` antes de usar meus comandos! (*`Error 406`*)");

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('este comando só pode ser executado num servidor! (*`Error 409`*)');
	}

  	if ((command.devOnly || command.ownerOnly) && !users[message.author.id].dev) return message.reply("Este comando é para **Desenvolvedores** apenas. (*`Error 405`*)")

	if (command.beta && !users[message.author.id].beta) return message.reply("Este comando está sendo desenvolvido ainda. (*`Error 423`*)");

	if (command.perms > user.perms) return message.reply(`Você não possui permissões para utilizar este comando. (*\`Error 403\`*)`);

	if (command.args && !args.length) {
		let reply = `Você não passou nenhum argumento, ${message.author}! (*\`Error 411\`*)`;

		if (command.usage) {
			reply += `\nA forma correta seria: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		if (message.content.includes("-nocd") && users[message.author.id].dev) {
			message.react("⏰");
		} else {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			const errCode = Math.random() < 0.000001 ? 418 : 408;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply(`Aguarde ${timeLeft.toFixed(1)}s antes de reutilizar o \`${command.name}\`! (*\`Error ${errCode}\`*)`);
			}
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		console.log(`[200] ${message.author.tag}: ${message.content}`);
		command.execute(message, args);
	} catch (error) {
		console.error(error);

		console.log(`[502] ${message.author.tag}: ${message.content}`);
		message.reply(`**ERROR 502** - \`Bad Gateway\`\n\n\`\`\`\n${error}\`\`\``);
	}
});
*/

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

const http = require('http');
const server = http.createServer((req, res) => {
	res.writeHead(200);
	res.end('Up and running!');
});

server.listen(3000);

client.login(process.env.TOKEN);