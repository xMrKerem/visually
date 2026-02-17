const translate = require("../utils/Translate");

module.exports = {
    name: "mute",
    aliases: ["sustur", "timeout", "cezalandır"],
    displayName: "CMD_NAME_MUTE",
    description: "CMD_DESC_MUTE",
    permLevel: 3,

    slashCommand: {
        name: "mute",
        name_localizations: { "tr": "sustur" },
        description: "Timeouts a user for a specified duration.",
        description_localizations: { "tr": "Kullanıcıyı belirli bir süre susturur (Zaman Aşımı)." },
        type: 1,
        default_member_permissions: "4194304",
        options: [
            {
                name: "user",
                name_localizations: { "tr": "kullanıcı" },
                description: "The user to mute.",
                description_localizations: { "tr": "Susturulacak kullanıcı." },
                type: 6,
                required: true
            },
            {
                name: "duration",
                name_localizations: { "tr": "süre" },
                description: "Duration (e.g., 10m, 1h, 1d).",
                description_localizations: { "tr": "Süre (örn: 10m, 1h, 1d)." },
                type: 3,
                required: true
            },
            {
                name: "reason",
                name_localizations: { "tr": "sebep" },
                description: "Reason for the mute.",
                description_localizations: { "tr": "Susturma sebebi." },
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

        let targetId, durationStr, reason;

        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            targetId = msgOrInteraction.data.options[0].value;
            durationStr = msgOrInteraction.data.options[1].value;
            reason = msgOrInteraction.data.options[2] ? msgOrInteraction.data.options[2].value : translate("NO_REASON", lang);
        } else if (args && args[0]) {
            targetId = msgOrInteraction.mentions[0] ? msgOrInteraction.mentions[0].id : args[0];
            durationStr = args[1];
            reason = args.slice(2).join(" ") || translate("NO_REASON", lang);
        }

        if (!targetId) return reply({ content: translate("MUTE_NO_USER", lang), flags: 64 });
        if (!durationStr) return reply({ content: translate("MUTE_NO_DURATION", lang), flags: 64 });

        const match = durationStr.match(/^(\d+)(m|h|d|w)$/);
        if (!match) return reply({ content: translate("MUTE_INVALID_DURATION", lang), flags: 64 });

        const value = parseInt(match[1]);
        const unit = match[2];
        let ms = 0;

        if (unit === "m") ms = value * 60 * 1000;
        else if (unit === "h") ms = value * 60 * 60 * 1000;
        else if (unit === "d") ms = value * 24 * 60 * 60 * 1000;
        else if (unit === "w") ms = value * 7 * 24 * 60 * 60 * 1000;

        if (ms > 28 * 24 * 60 * 60 * 1000) return reply({ content: translate("MUTE_TOO_LONG", lang), flags: 64 });

        const timeoutUntil = new Date(Date.now() + ms).toISOString();

        try {
            await bot.editGuildMember(msgOrInteraction.guildID, targetId, {
                communicationDisabledUntil: timeoutUntil
            }, reason);

            return reply({
                content: translate("MUTE_SUCCESS", lang, { user: `<@${targetId}>`, time: durationStr, reason: reason })
            });

        } catch (err) {
            console.error(err);
            return reply({ content: translate("MUTE_FAIL", lang), flags: 64 });
        }
    }
};