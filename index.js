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

  if (command === '!привет' || command === '!hello') {
    return message.reply('☠️ Добро пожаловать в BLOODGRIEF, смертный.');
  }

  if (command === '!инфо') {
    return message.channel.send(`🩸 Это официальный бот проекта **BLOODGRIEF**.\nМодерация, защита, тикеты и антикибермрак. Выживай или проиграй.`);
  }

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

// 🎟️ Автоответ в тикет через 2 сек (только один раз, с пингом автора)
client.on('channelCreate', async (channel) => {
  if (
    channel.type === 0 && // текстовый канал
    channel.name.startsWith('ticket')
  ) {
    setTimeout(async () => {
      try {
        const messages = await channel.messages.fetch({ limit: 10 });

        // Проверка: бот уже писал?
        const alreadySent = messages.some(msg =>
          msg.author.id === client.user.id &&
          msg.content.includes('Жди стафф')
        );
        if (alreadySent) return;

        // Поиск первого сообщения от пользователя
        const userMessage = messages.find(msg => !msg.author.bot);
        const mention = userMessage ? `<@${userMessage.author.id}>` : '';

        await channel.send(`👋 Привет, ${mention} Жди стафф — скоро кто-то из команды ответит на твой тикет.`);
      } catch (err) {
        console.error('❌ Ошибка при автоответе в тикет:', err);
      }
    }, 2000);
  }
});

client.login(process.env.TOKEN);
