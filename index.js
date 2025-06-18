const { Client, GatewayIntentBits, Partials, PermissionsBitField, EmbedBuilder } = require('discord.js');
const http = require('http');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
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
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // !инфо
  if (command === 'инфо') {
    return message.channel.send(
      '🩸 **Я — официальный бот проекта BLOODGRIEF** 🩸\n\n' +
      'Я отвечаю за тикеты, модерацию и автоматизацию сервера.\n' +
      'Меня создал и настроил основатель проекта.\n\n' +
      '⚙️ Буду развиваться с каждым апдейтом.\n\n' +
      '**Сделал:** NaSkille'
    );
  }

  // !снеси
  if (command === 'снеси') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ У тебя нет прав на удаление сообщений.');
    }

    const count = parseInt(args[0]);
    if (!count || isNaN(count)) return message.reply('❗ Укажи число: `!снеси 20`');
    if (count < 1 || count > 5000) return message.reply('❗ Можно удалить от 1 до 5000 сообщений.');

    let deleted = 0;
    let lastId = null;

    try {
      while (deleted < count) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await message.channel.messages.fetch(options);
        if (!messages.size) break;

        for (const msg of messages.values()) {
          if (deleted >= count) break;
          try {
            await msg.delete();
            deleted++;
            await new Promise(res => setTimeout(res, 250));
          } catch (e) {
            console.log(`Ошибка при удалении: ${msg.id}`, e.message);
          }
          lastId = msg.id;
        }
      }

      message.channel.send(`✅ Удалено ${deleted} сообщений.`).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });

    } catch (err) {
      console.error('[СНЕСИ ERROR]', err);
      message.reply('⚠️ Не удалось удалить сообщения. Возможно, они слишком старые.');
    }
  }

  // !проверь
  if (command === 'проверь') {
    const ownerRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'owner');
    if (!ownerRole || !message.member.roles.cache.has(ownerRole.id)) {
      return message.reply('🚫 Только владельцы проекта могут использовать эту команду.');
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply('❗ Укажи пользователя: `!проверь @user`');

    const accountAge = Math.floor((Date.now() - target.user.createdAt) / (1000 * 60 * 60 * 24));
    const joinedAge = Math.floor((Date.now() - target.joinedAt) / (1000 * 60 * 60 * 24));
    const isSuspicious = accountAge < 7 || !target.user.avatar;
    const riskyNameTags = ['cheat', 'hack', 'bypass', 'aura', 'aim', '1337'];
    const tagLower = target.user.tag.toLowerCase();
    const riskyName = riskyNameTags.find(w => tagLower.includes(w));
    const forbiddenRoles = ['ЧС', 'Мут', 'На проверке'];
    const hasForbidden = target.roles.cache.some(role => forbiddenRoles.includes(role.name));
    const hasAvatar = !!target.user.avatar;
    const hasNitro = target.user.avatar && target.user.avatar.startsWith('a_');
    const presence = target.presence?.status || '⚫ Оффлайн';

    const embed = new EmbedBuilder()
      .setColor(isSuspicious || riskyName || hasForbidden ? 0xff0000 : 0x00ff00)
      .setTitle(`📋 Проверка: ${target.user.tag}`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 Discord ID', value: target.id, inline: false },
        { name: '📶 Статус', value: presence, inline: true },
        { name: '📅 Аккаунт создан', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 На сервере с', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🖼️ Аватар', value: hasAvatar ? '✅ Есть' : '❌ Нет', inline: true },
        { name: '💎 Nitro', value: hasNitro ? '✅ Да' : '❌ Нет', inline: true },
        { name: '🎭 Роли', value: target.roles.cache.map(r => r.name).slice(1).join(', ') || 'нет', inline: false },
        { name: '💣 Ник', value: riskyName ? `⚠️ Обнаружено: \`${riskyName}\`` : '✅ Чисто', inline: false },
        { name: '🚫 Подозрительные роли', value: hasForbidden ? '❗ Есть запрещённые роли' : '✅ Нет', inline: false },
        { name: '🔍 Вывод', value: (isSuspicious || riskyName || hasForbidden) ? '⚠️ Возможна опасность, требуется доп. проверка.' : '✅ Безопасен', inline: false }
      )
      .setFooter({ text: 'BLOODGRIEF — внутренняя проверка' })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
});

// Автоответ в тикет-канале
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

// Запуск
client.login(process.env.TOKEN);

// HTTP сервер для Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is alive');
}).listen(process.env.PORT || 3000);


