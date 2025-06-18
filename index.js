const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const http = require('http'); // 👈 подключаем сервер для Render

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`[BOT] ${client.user.tag} запущен!`);
  client.user.setPresence({
    activities: [{ name: '🩸 Официальный бот проекта BLOODGRIEF 🩸', type: 0 }],
    status: 'online'
  });
});

client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // !снеси
  if (command === '!снеси') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ У тебя нет прав на удаление сообщений.');
    }

    const count = parseInt(args[0]);

    if (!count || isNaN(count)) {
      return message.reply('❗ Укажи число: `!снеси 30`');
    }

    if (count > 100 || count < 1) {
      return message.reply('❗ Укажи число от 1 до 100: `!снеси 30`');
    }

    try {
      await message.channel.bulkDelete(count + 1, true);
      message.channel.send(`🧹 Удалено ${count} сообщений`).then(msg => {
        setTimeout(() => msg.delete(), 3000);
      });
    } catch (err) {
      console.error('[bulkDelete ERROR]', err);
      message.reply('⚠️ Не удалось удалить сообщения. Возможно, они слишком старые.');
    }
  }

  // !инфо
  if (command === '!инфо') {
    return message.channel.send(
      `🩸 **Я — официальный бот проекта BLOODGRIEF** 🩸\n\n` +
      `Я отвечаю за тикеты, модерацию, команды и порядок на сервере.\n` +
      `Меня создал и настроил создатель проекта, чтобы обеспечить безопасность и функциональность.\n\n` +
      `⚙️ Мой функционал будет расширяться с каждым обновлением.\n\n` +
      `**Сделал:** NaSkille`
    );
  }
});

// Автоответ в тикет-канале
client.on('channelCreate', async channel => {
  if (!channel.isTextBased()) return;
  if (!channel.name.includes('ticket')) return;

  setTimeout(async () => {
    try {
      const messages = await channel.messages.fetch({ limit: 5 });
      const userMessage = messages.find(msg => msg.author && !msg.author.bot);
      const user = userMessage?.author;

      if (user) {
        channel.send(`👋 Привет, ${user}! Жди стафф — скоро кто-то из команды ответит на твой тикет.`);
      }
    } catch (err) {
      console.error('[TICKET RESPONSE ERROR]', err);
    }
  }, 2000);
});

// Авторизация
client.login(process.env.TOKEN);

// 🛡️ Фейковый порт для Render, чтобы он не крашил бота
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is alive');
}).listen(process.env.PORT || 3000);

