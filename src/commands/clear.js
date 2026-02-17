const translate = require("../utils/Translate");

module.exports = {
    name: "clear",
    aliases: ["sil", "temizle", "purge"],
    displayName: "CMD_NAME_CLEAR",
    description: "CMD_DESC_CLEAR",
    permLevel: 3,

    slashCommand: {
        name: "clear",
        name_localizations: { "tr": "sil" },
        description: "Deletes a specified number of messages.",
        description_localizations: { "tr": "Belirtilen miktarda mesajı siler." },
        type: 1,
        default_member_permissions: "8192",
        options: [
            {
                name: "amount",
                name_localizations: { "tr": "miktar" },
                description: "Number of messages (1-100).",
                description_localizations: { "tr": "Silinecek mesaj sayısı (1-100)." },
                type: 4,
                required: true,
                min_value: 1,
                max_value: 100
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

        let amount = 0;
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            amount = msgOrInteraction.data.options[0].value;
        } else if (args && args[0]) {
            amount = parseInt(args[0]);
        }

        if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
            return reply({ content: translate("CLEAR_INVALID", lang), flags: 64 });
        }

        try {
            const deleted = await bot.purgeChannel(msgOrInteraction.channel.id, amount);

            const count = deleted;

            if(msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return reply({ content: translate("CLEAR_SUCCESS", lang, { count: count }), flags: 64 });
            } else {
                const m = await reply(translate("CLEAR_SUCCESS", lang, { count: count }));
                setTimeout(() => m.delete().catch(() => {}), 5000);
            }

        } catch (err) {
            console.error(err);
            return reply({ content: translate("CLEAR_FAIL", lang), flags: 64 });
        }
    }
};