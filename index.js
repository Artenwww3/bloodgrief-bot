const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const http = require('http');

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

  // !снеси до 10000 сообщений
  if (command === '!снеси') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ У тебя нет прав на удаление сообщений.');
    }

    const count = parseInt(args[0]);
    if (!count || isNaN(count)) return message.reply('❗ Укажи число: `!снеси 30`');
    if (count < 1 || count > 10000) return message.reply('❗ Укажи число от 1 до 10000.');

    let deleted = 0;
    let left = count;

    try {
      while (left > 0) {
        const toDelete = left > 100 ? 100 : left;
        const messages = await message.channel.bulkDelete(toDelete, true);
        deleted += messages.size;
        left -= messages.size;

        if (messages.size < toDelete) break;
        await new Promise(res => setTimeout(res, 1000)); // антиспам
      }

      message.channel.send(`🧹 Удалено ${deleted} сообщений`).then(msg => {
        setTimeout(() => msg.delete(), 3000);
      });
    } catch (err) {
      console.error('[bulkDelete ERROR]', err);
      message.reply('⚠️ Ошибка: возможно, сообщения старше 14 дней.');
    }
  }

  // !инфо
  if (command === '!инфо') {
    return message.channel.send(
      `🩸 **Я — официальный бот проекта BLOODGRIEF** 🩸\n\n` +
      `Я отвечаю за тикеты, модерацию и автоматизацию сервера.\n` +
      `Меня создал и настроил основатель проекта.\n\n` +
      `⚙️ Буду развиваться с каждым апдейтом.\n\n` +
      `**Сделал:** NaSkille`
    );
  }
});

// Ответ в тикет-канале
client.on('channelCreate', async channel => {
  if (!channel.isTextBased()) return;
  if (!channel.name.includes('ticket')) return;

  setTimeout(async () => {
    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      const userMessage = messages.find(msg => !msg.author.bot);
      const user = userMessage?.author;

      if (user) {
        channel.send(`👋 Привет, <@${user.id}>! Жди стафф — скоро кто-то из команды ответит на твой тикет.`);
      } else {
        channel.send(`👋 Привет! Жди стафф — скоро кто-то из команды ответит на твой тикет.`);
      }
    } catch (err) {
      console.error('[TICKET AUTO-RESPONSE ERROR]', err);
    }
  }, 2000);
});

// Запуск бота
client.login(process.env.TOKEN);

// Фейковый сервер для Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is alive');
}).listen(process.env.PORT || 3000);


