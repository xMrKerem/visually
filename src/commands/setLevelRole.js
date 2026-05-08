const Guild = require("../database/models/Guild");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");
const translate = require("../utils/Translate");

const getLocalization = (keyname) => ({ tr: tr[keyname] });

module.exports = {
    name: "setlevelrole",
    aliases: ["seviyerol", "levelrole", "seviyerol-ayarla"],
    displayName: "CMD_NAME_SETLEVELROLE",
    description: "CMD_DESC_SETLEVELROLE",
    permLevel: 4,

    slashCommand: {
        name: "setlevelrole",
        description: en.CMD_DESC_SETLEVELROLE,
        description_localizations: getLocalization("CMD_DESC_SETLEVELROLE"),
        options: [
            {
                name: "seviye",
                name_localizations: { en: "level" },
                description: en.SETLEVELROLE_OPTION_LEVEL,
                description_localizations: getLocalization("SETLEVELROLE_OPTION_LEVEL"),
                type: 4,
                required: true,
                min_value: 1
            },
            {
                name: "rol",
                name_localizations: { en: "role" },
                description: en.SETLEVELROLE_OPTION_ROLE,
                description_localizations: getLocalization("SETLEVELROLE_OPTION_ROLE"),
                type: 8,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        if (!msgOrInteraction.acknowledge) return;

        const level = msgOrInteraction.data?.options?.find((option) => option.name === "seviye")?.value;
        const roleId = msgOrInteraction.data?.options?.find((option) => option.name === "rol")?.value;
        const guildId = msgOrInteraction.guildID;

        if (!level || !roleId || !guildId) {
            return msgOrInteraction.createMessage({
                content: translate("SETLEVELROLE_INVALID", lang),
                flags: 64
            });
        }

        await msgOrInteraction.acknowledge();

        const guildDataDoc = await Guild.findOneAndUpdate(
            { guildId },
            { $setOnInsert: { guildId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        guildDataDoc.levelRoles.set(String(level), roleId);
        await guildDataDoc.save();

        return msgOrInteraction.createFollowup({
            embed: {
                title: translate("SETLEVELROLE_TITLE", lang),
                description: translate("SETLEVELROLE_UPDATED", lang, {
                    level,
                    role: roleId
                }),
                color: 0x9b59b6
            }
        });
    }
};
