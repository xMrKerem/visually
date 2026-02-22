const translate = require("../utils/Translate");
const en = require("../locales/en.json");
const tr = require("../locales/tr.json");

const getLocalizations = (keyname) => {
    return {
        "tr": tr[keyname],
    }
}

module.exports = {
    name: "prefix",
    aliases: ["önek", "p"],
    description: "CMD_DESC_PREFIX",
    displayName: "CMD_NAME_PREFIX",
    permLevel: 4,

    slashCommand: {
        name: "prefix",
        name_localizations: getLocalizations("CMD_NAME_PREFIX"),
        description: en.CMD_DESC_PREFIX,
        description_localizations: getLocalizations("CMD_DESC_PREFIX"),
        type: 1,
        default_member_permissions: "8",
        options: [
            {
                name: "new_prefix",
                name_localizations: { "tr": "yeni_önek" },
                description: "New prefix (max 3 chars)",
                description_localizations: { "tr": "Yeni ön ek (maks 3 karakter)" },
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData.language || "en";

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return msgOrInteraction.createMessage(payload);
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        let newPrefix;
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            newPrefix = msgOrInteraction.data.options[0].value;
        } else if (args && args[0]) {
            newPrefix = args[0];
        }

        if (!newPrefix) {
            return reply({ content: translate("PREFIX_MISSING", lang), flags: 64 });
        }

        if (newPrefix.length > 3) {
            return reply({ content: translate("PREFIX_TOO_LONG", lang), flags: 64 });
        }

        guildData.prefix = newPrefix;
        await guildData.save();

        if (bot.prefixCache) {
            bot.prefixCache.set(msgOrInteraction.guildID, newPrefix);
        }

        return reply(translate("PREFIX_UPDATED", lang, { prefix: newPrefix }));
    }
};