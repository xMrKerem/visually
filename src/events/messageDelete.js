const Guild = require("../database/models/Guild");

module.exports = {
    name: "messageDelete",
    execute: async (bot, message) => {
        if (!message || !message.author || message.author.bot) return;
        if (!message.guildID) return;

        const guildData = await Guild.findOne({ guildId: message.guildID });
        if (!guildData || !guildData.logChannel) return;

        const embed = {
            title: "🗑️ Mesaj Silindi",
            color: 0xe74c3c,
            fields: [
                {
                    name: "👤 Kullanıcı",
                    value: `<@${message.author.id}> (${message.author.username})`,
                    inline: true
                },
                {
                    name: "📍 Kanal",
                    value: `<#${message.channel.id}>`,
                    inline: true
                },
                {
                    name: "📄 İçerik",
                    value: message.content ? message.content.substring(0, 1024) : "*Görsel veya Embed*"
                }
            ],
            footer: { text: `User ID: ${message.author.id}` },
            timestamp: new Date()
        };

        bot.createMessage(guildData.logChannel, { embed: embed }).catch(() => {});
    }
};