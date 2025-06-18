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

// 🟢 Когда бот готов
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

// 💬 Команды
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Приветствие
  if (command === '!привет' || command === '!hello') {
    return message.reply('☠️ Добро пожаловать в BLOODGRIEF, смертный.');
  }

  // Информация
  if (command === '!инфо') {
    return message.channel.send(`🩸 Это официальный бот проекта **BLOODGRIEF**.\nМодерация, защита, тикеты и антикибермрак. Выживай или проиграй.`);
  }

  // Очистка сообщений
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

// 🎟️ Автоматическое сообщение при создании тикета
client.on('channelCreate', async (channel) => {
  // Проверяем, что это текстовый канал и его имя начинается с ticket
  if (
    channel.type === 0 && // 0 — текстовый канал (в v14)
    channel.name.startsWith('ticket')
  ) {
    try {
      await channel.send(`👋 Привет! Жди стафф — скоро кто-то из команды ответит на твой тикет.`);
    } catch (err) {
      console.error('❌ Не удалось отправить сообщение в новый тикет:', err);
    }
  }
});

// 🔐 Запуск бота
client.login(process.env.TOKEN);

