const translate = require("../utils/translate");
const en = require("../locales/en.json");
const tr = require("../locales/tr.json");

const getLocalizations = (keyname) => {
    return {
        "tr": tr[keyname],
        "en-US": en[keyname],
        "en-GB": en[keyname]
    }
}

module.exports = {
    name: "slang",
    aliases: ["argo", "küfür", "samimiyet"],
    displayName: "CMD_NAME_SLANG",
    description: "CMD_DESC_SLANG",
    permLevel: 4,

    slashCommand: {
        name: "slang",
        name_localizations: getLocalizations("CMD_NAME_SLANG"),
        description: en.CMD_DESC_SLANG,
        description_localizations: getLocalizations("CMD_DESC_SLANG"),
        type: 1,
        default_member_permissions: "8",
        options: [
            {
                name: "status",
                name_localizations: { "tr": "durum" },
                description: "Enable or disable slang mode",
                description_localizations: { "tr": "Argo modunu aç veya kapat" },
                type: 3,
                required: true,
                choices: [
                    { name: "Enable (Aç)", value: "on" },
                    { name: "Disable (Kapat)", value: "off" }
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

        let status;

        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            status = msgOrInteraction.data.options[0].value;
        } else if (args && args[0]) {
            const arg = args[0].toLowerCase();
            if (["aç", "ac", "aktif", "enable", "on", "true"].includes(arg)) status = "on";
            else if (["kapat", "pasif", "disable", "off", "false"].includes(arg)) status = "off";
        }

        if (!status || !["on", "off"].includes(status)) {
            return reply({ content: translate("INVALID_SLANG_ARG", lang), flags: 64 });
        }

        const newValue = (status === "on");

        guildData.slangMode = newValue;
        await guildData.save();

        if (newValue) {
            return reply(translate("SLANG_ENABLED", lang));
        } else {
            return reply(translate("SLANG_DISABLED", lang));
        }
    }
};