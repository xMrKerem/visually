const translate = require("../utils/Translate");
const en = require("../locales/en.json");
const tr = require("../locales/tr.json");

const getLocalizations = (keyname) => {
    return {
        "tr": tr[keyname],
    }
}

module.exports = {
    name: "language",
    aliases: ["dil", "lang"],
    description: "CMD_DESC_LANGUAGE",
    displayName: "CMD_NAME_LANGUAGE",
    permLevel: 4,

    slashCommand: {
        name: "language",
        name_localizations: getLocalizations("CMD_NAME_LANGUAGE"),
        description: en.CMD_DESC_LANGUAGE,
        description_localizations: getLocalizations("CMD_DESC_LANGUAGE"),
        type: 1,
        default_member_permissions: "8",
        options: [
            {
                name: "code",
                name_localizations: { "tr": "kod" },
                description: "Language code (tr/en)",
                description_localizations: { "tr": "Dil kodu (tr/en)" },
                type: 3,
                required: true,
                choices: [
                    { name: "Türkçe", value: "tr" },
                    { name: "English", value: "en" }
                ]
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

        let targetLang;
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            targetLang = msgOrInteraction.data.options[0].value;
        } else if (args && args[0]) {
            targetLang = args[0].toLowerCase();
        }

        if (!targetLang || !["tr", "en"].includes(targetLang)) {
            return reply({ content: translate("INVALID_LANG", lang), flags: 64 });
        }

        guildData.language = targetLang;
        await guildData.save();

        return reply(translate("LANG_UPDATED", targetLang, { lang: targetLang.toUpperCase() }));
    }
};