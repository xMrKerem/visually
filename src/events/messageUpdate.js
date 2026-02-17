const Guild = require("../database/models/Guild");

module.exports = {
    name: "messageUpdate",
    execute: async (bot, newMessage, oldMessage) => {
        if (!oldMessage || !newMessage || !newMessage.author || newMessage.author.bot) return;
        if (!newMessage.guildID) return;
        if (oldMessage.content === newMessage.content) return;

        const guildData = await Guild.findOne({ guildId: newMessage.guildID });
        if (!guildData || !guildData.logChannel) return;

        const embed = {
            title: "✏️ Mesaj Düzenlendi",
            color: 0xf1c40f,
            fields: [
                {
                    name: "👤 Kullanıcı",
                    value: `<@${newMessage.author.id}>`,
                    inline: true
                },
                {
                    name: "📍 Kanal",
                    value: `<#${newMessage.channel.id}>`,
                    inline: true
                },
                {
                    name: "📜 Eski Hali",
                    value: oldMessage.content ? oldMessage.content.substring(0, 1024) : "*Bilinmiyor*"
                },
                {
                    name: "🆕 Yeni Hali",
                    value: newMessage.content ? newMessage.content.substring(0, 1024) : "*Bilinmiyor*"
                }
            ],
            footer: { text: `Mesaj ID: ${newMessage.id}` },
            timestamp: new Date()
        };

        bot.createMessage(guildData.logChannel, { embed: embed }).catch(() => {});
    }
};