const translate = require("../utils/Translate");

module.exports = {
    name: "unmute",
    aliases: ["sustur-kaldır", "konuştur", "untimeout"],
    displayName: "CMD_NAME_UNMUTE",
    description: "CMD_DESC_UNMUTE",
    permLevel: 3,

    slashCommand: {
        name: "unmute",
        name_localizations: { "tr": "sustur-kaldir" },
        description: "Removes the timeout from a user.",
        description_localizations: { "tr": "Kullanıcının susturmasını (zaman aşımını) kaldırır." },
        type: 1,
        default_member_permissions: "4194304",
        options: [
            {
                name: "user",
                name_localizations: { "tr": "kullanıcı" },
                description: "The user to unmute.",
                description_localizations: { "tr": "Susturması kaldırılacak kullanıcı." },
                type: 6,
                required: true
            },
            {
                name: "reason",
                name_localizations: { "tr": "sebep" },
                description: "Reason for unmute.",
                description_localizations: { "tr": "Kaldırma sebebi." },
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

        if (!targetId) return reply({ content: translate("UNMUTE_NO_USER", lang), flags: 64 });

        try {
            await bot.editGuildMember(msgOrInteraction.guildID, targetId, {
                communicationDisabledUntil: null
            }, reason);

            return reply({
                content: translate("UNMUTE_SUCCESS", lang, { user: `<@${targetId}>`, reason: reason })
            });

        } catch (err) {
            console.error(err);
            return reply({ content: translate("UNMUTE_FAIL", lang), flags: 64 });
        }
    }
};