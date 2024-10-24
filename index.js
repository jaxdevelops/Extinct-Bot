const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const TOKEN = process.env.DISCORD_TOKEN; // Store your bot token in an environment variable
const PREFIX = '/'; // Use slash commands

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Command handling
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // /help command
    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Help Commands')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '/help', value: 'Lists all moderation commands and their descriptions.' },
                { name: '/ping', value: 'Checks the bot\'s responsiveness.' },
                { name: '/info', value: 'Provides information about the server and its moderation status.' },
                { name: '/kick', value: 'Kicks a specified user from the server.' },
                { name: '/ban', value: 'Bans a specified user from the server.' },
                { name: '/unban', value: 'Unbans a user using their ID.' },
                { name: '/warn', value: 'Issues a warning to a user.' },
                { name: '/warnings', value: 'Displays the number of warnings a user has received.' },
                { name: '/removewarning', value: 'Removes a warning from a specified user.' },
                { name: '/timeout', value: 'Temporarily times out a user for a specified duration.' }
            );

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    // /ping command
    if (commandName === 'ping') {
        await interaction.reply(`Pong! Latency is ${client.ws.ping}ms.`);
    }

    // /kick command
    if (commandName === 'kick') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            await member.kick(reason);
            await interaction.reply(`${user.tag} has been kicked. Reason: ${reason}`);
        } else {
            await interaction.reply('User not found.');
        }
    }

    // /ban command
    if (commandName === 'ban') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            await member.ban({ reason });
            await interaction.reply(`${user.tag} has been banned. Reason: ${reason}`);
        } else {
            await interaction.reply('User not found.');
        }
    }

    // /unban command
    if (commandName === 'unban') {
        const userId = options.getString('user_id');

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            await interaction.reply('User not found or unable to unban.');
        }
    }

    // Additional commands like /warn, /warnings, /removewarning, and /timeout would follow a similar structure.
});

client.login(TOKEN);
