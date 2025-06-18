const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ✅ Когда бот включается
client.once('ready', () => {
  console.log(`🟢 ${client.user.tag} запущен и готов!`);

  // Устанавливаем статус
  client.user.setPresence({
    activities: [{
      name: '🩸 Официальный бот проекта BLOODGRIEF 🩸',
      type: ActivityType.Playing
    }],
    status: 'dnd'
  });
});

// 💬 Пример автоответа на текстовое сообщение
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === '!привет' || msg === '!hello') {
    message.reply('☠️ Добро пожаловать в BLOODGRIEF, смертный.');
  }

  if (msg === '!инфо') {
    message.channel.send(`🩸 Это официальный бот проекта **BLOODGRIEF**. Здесь тебя ждёт боль, хаос и выживание.`);
  }
});

// 🔐 Токен теперь через переменные окружения (для безопасности)
client.login(process.env.TOKEN);
