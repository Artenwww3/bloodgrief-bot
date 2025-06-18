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

  // !снеси — удаление до 5000 любых сообщений
  if (command === '!снеси') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ У тебя нет прав на удаление сообщений.');
    }

    const count = parseInt(args[0]);
    if (!count || isNaN(count)) return message.reply('❗ Укажи количество сообщений: `!снеси 50`');
    if (count < 1 || count > 5000) return message.reply('❗ Укажи число от 1 до 5000.');

    try {
      let deleted = 0;
      let lastMessageId = null;

      while (deleted < count) {
        const options = { limit: 100 };
        if (lastMessageId) options.before = lastMessageId;

        const messages = await message.channel.messages.fetch(options);
        if (messages.size === 0) break;

        for (const msg of messages.values()) {
          if (deleted >= count) break;
          try {
            await msg.delete();
            deleted++;
            await new Promise(res => setTimeout(res, 300)); // задержка (анти-спам)
          } catch (err) {
            console.log(`❌ Не смог удалить сообщение ID ${msg.id}`, err);
          }
          lastMessageId = msg.id;
        }
      }

      message.channel.send(`✅ Удалено ${deleted} сообщений.`).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });

    } catch (err) {
      console.error('[slowDelete ERROR]', err);
      message.reply('⚠️ Произошла ошибка при удалении сообщений.');
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

// Автоответ в тикет-канале с пингом
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
      console.error('[TICKET RESPONSE ERROR]', err);
    }
  }, 2000);
});

client.login(process.env.TOKEN);

// Фейковый сервер для Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is alive');
}).listen(process.env.PORT || 3000);



