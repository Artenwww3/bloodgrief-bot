const { Client, GatewayIntentBits, ActivityType, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`🟢 Бот ${client.user.tag} успешно запущен!`);

  client.user.setPresence({
    activities: [{
      name: '🩸 Официальный бот проекта BLOODGRIEF 🩸',
      type: ActivityType.Playing
    }],
    status: 'dnd'
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // 💬 Приветствие
  if (command === '!привет' || command === '!hello') {
    return message.reply('☠️ Добро пожаловать в BLOODGRIEF, смертный.');
  }

  // ℹ️ Информация
  if (command === '!инфо') {
    return message.channel.send(`🩸 Это официальный бот проекта **BLOODGRIEF**.\nМодерация, защита, тикеты и антикибермрак. Выживай или проиграй.`);
  }

  // 🧹 Команда удаления сообщений
  if (command === '!снеси') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ У тебя нет прав на удаление сообщений.');
    }

    const count = parseInt(args[0]);
    if (!count || isNaN(count) || count < 1 || count > 100) {
      return message.reply('❗ Укажи количество сообщений от 1 до 100, например: `!снеси 20`');
    }

    try {
      await message.channel.bulkDelete(count + 1, true);
      message.channel.send(`🧹 Удалено ${count} сообщений`).then(msg => {
        setTimeout(() => msg.delete(), 3000);
      });
    } catch (err) {
      console.error(err);
      message.reply('⚠️ Не удалось удалить сообщения. Возможно, они слишком старые или нет прав.');
    }
  }
});

// 🔐 Токен (через Render переменную TOKEN)
client.login(process.env.TOKEN);
