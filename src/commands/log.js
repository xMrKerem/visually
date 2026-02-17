const Guild = require("../database/models/Guild");
const translate = require("../utils/Translate");

module.exports = {
    name: "log",
    aliases: ["modlog", "kayıt"],
    displayName: "CMD_NAME_LOG",
    description: "CMD_DESC_LOG",
    permLevel: 4,

    slashCommand: {
        name: "log",
        name_localizations: { "tr": "log" },
        description: "Sets the modulation log channel.",
        description_localizations: { "tr": "Moderasyon log kanalını ayarlar." },
        type: 1,
        default_member_permissions: "32",
        options: [
            {
                name: "channel",
                name_localizations: { "tr": "kanal" },
                description: "The channel for logs. (Empty to reset)",
                description_localizations: { "tr": "Logların düşeceği kanal. (Sıfırlamak için boş bırakın)" },
                type: 7,
                required: false,
                channel_types: [0]
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);

        let channelId;

        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            channelId = msgOrInteraction.data.options[0].value;
        }
        else if (args && args.length > 0) {
            channelId = msgOrInteraction.channelMentions[0] || args[0];
        }

        if (!channelId) {
            guildData.logChannel = null;
            await guildData.save();
            return reply({ content: translate("LOG_RESET", lang), flags: 64 });
        }

        guildData.logChannel = channelId;
        await guildData.save();

        return reply({ content: translate("LOG_SET", lang, { channel: `<#${channelId}>` }) });
    }
};