const Guild = require("../database/models/Guild");
const translate = require("../utils/Translate");

module.exports = {
    name: "welcome",
    aliases: ["hg-bb", "hosgeldin-ayarla", "welcome-set"],
    displayName: "CMD_NAME_WELCOME",
    description: "CMD_DESC_WELCOME",
    permLevel: 4,

    slashCommand: {
        name: "welcome",
        name_localizations: { "tr": "hosgeldin" },
        description: "Sets the welcome/goodbye channel.",
        description_localizations: { "tr": "Hoşgeldin/Güle güle kanalını ayarlar." },
        type: 1,
        default_member_permissions: "32",
        options: [
            {
                name: "type",
                name_localizations: { "tr": "tür" },
                description: "Welcome or Goodbye?",
                description_localizations: { "tr": "Giriş mi Çıkış mı?" },
                type: 3,
                required: true,
                choices: [
                    { name: "Welcome (Join)", value: "welcome" },
                    { name: "Goodbye (Leave)", value: "goodbye" }
                ]
            },
            {
                name: "channel",
                name_localizations: { "tr": "kanal" },
                description: "The channel to send messages.",
                description_localizations: { "tr": "Mesajın atılacağı kanal." },
                type: 7,
                required: true,
                channel_types: [0]
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);

        let type, channelId;


        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            type = msgOrInteraction.data.options[0].value;
            channelId = msgOrInteraction.data.options[1].value;
        }
        else if (args && args.length >= 2) {
            const inputType = args[0].toLowerCase();
            if (["welcome", "hosgeldin", "giriş"].includes(inputType)) type = "welcome";
            else if (["goodbye", "gulegule", "çıkış"].includes(inputType)) type = "goodbye";
            else return reply({ content: translate("WELCOME_INVALID_TYPE", lang), flags: 64 });

            const inputChannel = args[1];
            channelId = inputChannel.replace(/[<#>]/g, "");

            const channel = bot.getChannel(channelId);
            if (!channel || channel.type !== 0) return reply({ content: translate("WELCOME_INVALID_CHANNEL", lang), flags: 64 });

        } else {
            return reply({ content: translate("WELCOME_USAGE_ERROR", lang), flags: 64 });
        }

        if (type === "welcome") {
            guildData.welcomeChannel = channelId;
            await guildData.save();
            return reply({ content: translate("WELCOME_SET", lang, { channel: `<#${channelId}>` }) });
        } else {
            guildData.goodbyeChannel = channelId;
            await guildData.save();
            return reply({ content: translate("GOODBYE_SET", lang, { channel: `<#${channelId}>` }) });
        }
    }
};