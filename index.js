const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const TOKEN = process.env.DISCORD_TOKEN; // Store your bot token in an environment variable

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
                { name: '/info', value: 'Provides information about the server.' },
                { name: '/kick [user] [reason]', value: 'Kicks a user from the server.' },
                { name: '/ban [user] [reason]', value: 'Bans a user from the server.' },
                { name: '/unban [user_id]', value: 'Unbans a user using their ID.' },
                { name: '/warn [user] [reason]', value: 'Issues a warning to a user.' },
                { name: '/warnings [user]', value: 'Displays the number of warnings a user has.' },
                { name: '/removewarning [user]', value: 'Removes a warning from a specified user.' },
                { name: '/timeout [user] [duration]', value: 'Temporarily times out a user.' },
                { name: '/slowmode [duration] [channel]', value: 'Sets slowmode for a specific channel.' }
            );

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    // /ping command
    else if (commandName === 'ping') {
        await interaction.reply(`Pong! Latency is ${client.ws.ping}ms.`);
    }

    // /info command
    else if (commandName === 'info') {
        const infoEmbed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Server Info')
            .setDescription(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
        await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
    }

    // /kick command
    else if (commandName === 'kick') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
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
    else if (commandName === 'ban') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
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
    else if (commandName === 'unban') {
        const userId = options.getString('user_id');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            await interaction.reply('User not found or unable to unban.');
        }
    }

    // /warn command
    else if (commandName === 'warn') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        // Store warnings in a JSON file or a database in production.
        await interaction.reply(`${user.tag} has been warned. Reason: ${reason}`);
    }

    // /warnings command
    else if (commandName === 'warnings') {
        const user = options.getUser('user');
        // Retrieve warnings from storage (not implemented here).
        await interaction.reply(`${user.tag} has 0 warnings.`);
    }

    // /removewarning command
    else if (commandName === 'removewarning') {
        const user = options.getUser('user');
        // Remove a warning from storage (not implemented here).
        await interaction.reply(`Removed a warning from ${user.tag}.`);
    }

    // /timeout command
    else if (commandName === 'timeout') {
        const user = options.getUser('user');
        const duration = options.getString('duration');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            const milliseconds = parseDuration(duration);
            if (milliseconds) {
                await member.timeout(milliseconds);
                await interaction.reply(`${user.tag} has been timed out for ${duration}.`);
            } else {
                await interaction.reply('Invalid duration format.');
            }
        } else {
            await interaction.reply('User not found.');
        }
    }

    // /slowmode command
    else if (commandName === 'slowmode') {
        const duration = options.getString('duration');
        const channel = options.getChannel('channel') || interaction.channel;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const seconds = parseDuration(duration) / 1000;
        if (seconds) {
            await channel.setRateLimitPerUser(seconds);
            await interaction.reply(`Slowmode set to ${duration} for ${channel}.`);
        } else {
            await interaction.reply('Invalid duration format.');
        }
    }
});

// Helper function to convert duration like "1m" or "2h" into milliseconds.
function parseDuration(duration) {
    const time = parseInt(duration.slice(0, -1));
    const unit = duration.slice(-1);
    if (isNaN(time)) return null;

    switch (unit) {
        case 's': return time * 1000;
        case 'm': return time * 60 * 1000;
        case 'h': return time * 60 * 60 * 1000;
        case 'd': return time * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

client.login(TOKEN);
