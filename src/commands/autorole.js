const Guild = require("../database/models/Guild");
const translate = require("../utils/Translate");

module.exports = {
    name: "autorole",
    aliases: ["otorol", "oto-rol"],
    displayName: "CMD_NAME_AUTOROLE",
    description: "CMD_DESC_AUTOROLE",
    permLevel: 4,

    slashCommand: {
        name: "autorole",
        name_localizations: { "tr": "otorol" },
        description: "Sets the automatic role for new members.",
        description_localizations: { "tr": "Yeni gelen üyelere verilecek otomatik rolü ayarlar." },
        type: 1,
        default_member_permissions: "268435456",
        options: [
            {
                name: "role",
                name_localizations: { "tr": "rol" },
                description: "The role to give (Select nothing to disable).",
                description_localizations: { "tr": "Verilecek rol (Kapatmak için boş bırakın)." },
                type: 8,
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);

        let roleId = null;

        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            roleId = msgOrInteraction.data.options[0].value;
        }
        else if (args && args[0]) {
            roleId = msgOrInteraction.roleMentions[0] || args[0];
        }

        if (!roleId) {
            guildData.autorole = null;
            await guildData.save();
            return reply({ content: translate("AUTOROLE_DISABLED", lang), flags: 64 });
        }

        guildData.autorole = roleId;
        await guildData.save();

        return reply({ content: translate("AUTOROLE_SET", lang, { role: `<@&${roleId}>` }) });
    }
};