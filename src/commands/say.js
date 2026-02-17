const translate = require("../utils/Translate");

module.exports = {
    name: "say",
    aliases: ["söylet", "duyur", "yaz"],
    displayName: "CMD_NAME_SAY",
    description: "CMD_DESC_SAY",
    permLevel: 0,

    slashCommand: {
        name: "say",
        name_localizations: { "tr": "söylet" },
        description: "Make the bot say something.",
        description_localizations: { "tr": "Bota bir mesaj yazdırır." },
        type: 1,
        default_member_permissions: null,
        options: [
            {
                name: "message",
                name_localizations: { "tr": "mesaj" },
                description: "The message to send.",
                description_localizations: { "tr": "Gönderilecek mesaj." },
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);

        let message;
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            message = msgOrInteraction.data.options[0].value;
        } else if (args && args.length > 0) {
            message = args.join(" ");
        } else {
            return reply({ content: translate("SAY_NO_TEXT", lang), flags: 64 });
        }

        if (message.includes("@everyone") || message.includes("@here")) {
            return reply({ content: translate("SAY_RESTRICTED", lang), flags: 64 });
        }

        await bot.createMessage(msgOrInteraction.channel.id, {
            content: message,
            allowedMentions: { everyone: false, roles: false, users: true }
        });

        if (msgOrInteraction.createMessage) {
            return msgOrInteraction.createMessage({ content: "✅", flags: 64 });
        }
        else {
            msgOrInteraction.delete().catch(() => {});
        }
    }
};