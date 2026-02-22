const translate = require("../utils/Translate");

module.exports = {
    name: "kick",
    aliases: ["at"],
    displayName: "CMD_NAME_KICK",
    description: "CMD_DESC_KICK",
    permLevel: 3,

    slashCommand: {
        name: "kick",
        name_localizations: { "tr": "at" },
        description: "Kicks a user from the server.",
        description_localizations: { "tr": "Bir kullanıcıyı sunucudan atar." },
        type: 1,
        default_member_permissions: "2",
        options: [
            {
                name: "user",
                name_localizations: { "tr": "kullanıcı" },
                description: "The user to kick.",
                description_localizations: { "tr": "Atılacak kullanıcı." },
                type: 6,
                required: true
            },
            {
                name: "reason",
                name_localizations: { "tr": "sebep" },
                description: "Reason for the kick.",
                description_localizations: { "tr": "Atılma sebebi." },
                type: 3,
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return msgOrInteraction.createMessage(payload);
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        let targetId, reason;

        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            targetId = msgOrInteraction.data.options[0].value;
            reason = msgOrInteraction.data.options[1] ? msgOrInteraction.data.options[1].value : translate("NO_REASON", lang);
        } else if (args && args[0]) {
            targetId = msgOrInteraction.mentions[0] ? msgOrInteraction.mentions[0].id : args[0];
            reason = args.slice(1).join(" ") || translate("NO_REASON", lang);
        }

        if (!targetId) return reply({ content: translate("KICK_NO_USER", lang), flags: 64 });

        try {
            await bot.kickGuildMember(msgOrInteraction.guildID, targetId, reason);

            return reply({
                content: translate("KICK_SUCCESS", lang, { user: `<@${targetId}>`, reason: reason })
            });

        } catch (err) {
            console.error(err);
            return reply({ content: translate("KICK_FAIL", lang), flags: 64 });
        }
    }
};