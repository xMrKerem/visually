const translate = require("../utils/Translate");

module.exports = {
    name: "ban",
    aliases: ["yasakla", "uçur"],
    displayName: "CMD_NAME_BAN",
    description: "CMD_DESC_BAN",
    permLevel: 3,

    slashCommand: {
        name: "ban",
        name_localizations: { "tr": "yasakla" },
        description: "Bans a user from the server.",
        description_localizations: { "tr": "Bir kullanıcıyı sunucudan yasaklar." },
        type: 1,
        default_member_permissions: "4",
        options: [
            {
                name: "user",
                name_localizations: { "tr": "kullanıcı" },
                description: "The user to ban.",
                description_localizations: { "tr": "Yasaklanacak kullanıcı." },
                type: 6,
                required: true
            },
            {
                name: "reason",
                name_localizations: { "tr": "sebep" },
                description: "Reason for the ban.",
                description_localizations: { "tr": "Yasaklanma sebebi." },
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

        if (!targetId) return reply({ content: translate("BAN_NO_USER", lang), flags: 64 });

        try {
            await bot.banGuildMember(msgOrInteraction.guildID, targetId, 0, reason);

            return reply({
                content: translate("BAN_SUCCESS", lang, { user: `<@${targetId}>`, reason: reason })
            });

        } catch (err) {
            console.error(err);
            return reply({ content: translate("BAN_FAIL", lang), flags: 64 });
        }
    }
};