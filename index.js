const {
  Client,
  GatewayIntentBits,
  ActivityType,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', async () => {
  console.log(`🟢 Бот ${client.user.tag} успешно запущен!`);

  client.user.setPresence({
    activities: [{
      name: '🩸 Официальный бот проекта BLOODGRIEF 🩸',
      type: ActivityType.Playing
    }],
    status: 'dnd'
  });

  // ➕ Slash-команды
  const commands = [
    new SlashCommandBuilder()
      .setName('инфо')
      .setDescription('Информация о проекте BLOODGRIEF')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash-команды успешно зарегистрированы');
  } catch (err) {
    console.error('❌ Ошибка при регистрации Slash-команд:', err);
  }
});

// 💬 Обычные команды
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

// 🎟️ Авто-сообщение в тикет через 2 сек с пингом (одноразово)
client.on('channelCreate', async (channel) => {
  if (
    channel.type === 0 &&
    channel.name.startsWith('ticket')
  ) {
    setTimeout(async () => {
      try {
        let userMessage;
        for (let i = 0; i < 2; i++) {
          const messages = await channel.messages.fetch({ limit: 10 });

          // Проверка — бот уже писал?
          const alreadySent = messages.some(msg =>
            msg.author.id === client.user.id &&
            msg.content.includes('Жди стафф')
          );
          if (alreadySent) return;

          userMessage = messages.find(msg => !msg.author.bot);
          if (userMessage) break;

          await new Promise(res => setTimeout(res, 2000)); // ждём ещё 2 сек
        }

        const mention = userMessage ? `<@${userMessage.author.id}>` : '';
        await channel.send(`👋 Привет, ${mention} Жди стафф — скоро кто-то из команды ответит на твой тикет.`);
      } catch (err) {
        console.error('❌ Ошибка при автоответе в тикет:', err);
      }
    }, 2000);
  }
});

// 🔁 Обработка Slash-команды
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'инфо') {
    await interaction.reply('🩸 Это официальный бот проекта **BLOODGRIEF**.\nМодерация, тикеты, защита и хаос.');
  }
});

client.login(process.env.TOKEN);

