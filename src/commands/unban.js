const translate = require("../utils/Translate");

module.exports = {
    name: "unban",
    aliases: ["yasak-kaldır", "affet"],
    displayName: "CMD_NAME_UNBAN",
    description: "CMD_DESC_UNBAN",
    permLevel: 3,

    slashCommand: {
        name: "unban",
        name_localizations: { "tr": "yasak-kaldir" },
        description: "Unbans a user from the server.",
        description_localizations: { "tr": "Bir kullanıcının yasağını kaldırır." },
        type: 1,
        default_member_permissions: "4",
        options: [
            {
                name: "user_id",
                name_localizations: { "tr": "kullanıcı_id" },
                description: "The ID of the user to unban.",
                description_localizations: { "tr": "Yasağı kaldırılacak kişinin ID'si." },
                type: 3,
                required: true
            },
            {
                name: "reason",
                name_localizations: { "tr": "sebep" },
                description: "Reason for unbanning.",
                description_localizations: { "tr": "Yasak kaldırma sebebi." },
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
            targetId = args[0];
            reason = args.slice(1).join(" ") || translate("NO_REASON", lang);
        }

        if (!targetId || !/^\d+$/.test(targetId)) {
            return reply({ content: translate("UNBAN_INVALID_ID", lang), flags: 64 });
        }

        try {
            await bot.unbanGuildMember(msgOrInteraction.guildID, targetId, reason);

            return reply({
                content: translate("UNBAN_SUCCESS", lang, { user_id: targetId, reason: reason })
            });

        } catch (err) {
            console.error(err);
            return reply({ content: translate("UNBAN_FAIL", lang), flags: 64 });
        }
    }
};