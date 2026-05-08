const Guild = require("../database/models/Guild");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");
const translate = require("../utils/Translate");

const getLocalization = (keyname) => ({ tr: tr[keyname] });

module.exports = {
    name: "setxp",
    aliases: ["setxpmultiplier", "guildxp", "xpkatsayi", "xpayarla"],
    displayName: "CMD_NAME_SETXPMULTIPLIER",
    description: "CMD_DESC_SETXPMULTIPLIER",
    permLevel: 4,

    slashCommand: {
        name: "setxp",
        description: en.CMD_DESC_SETXPMULTIPLIER,
        description_localizations: getLocalization("CMD_DESC_SETXPMULTIPLIER"),
        options: [
            {
                name: "multiplier",
                name_localizations: { tr: "carpan" },
                description: en.SETXPMULTIPLIER_OPTION_VALUE,
                description_localizations: getLocalization("SETXPMULTIPLIER_OPTION_VALUE"),
                type: 10,
                required: true,
                min_value: 0.5,
                max_value: 5.0
            }
        ]
    },

    execute: async (client, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        if (!msgOrInteraction.acknowledge) return;

        const multiplier = msgOrInteraction.data?.options?.find((option) => option.name === "multiplier")?.value;
        const guildId = msgOrInteraction.guildID;

        if (typeof multiplier !== "number" || !guildId) {
            return msgOrInteraction.createMessage({
                content: translate("SETXPMULTIPLIER_INVALID", lang),
                flags: 64
            });
        }

        await msgOrInteraction.acknowledge();

        await Guild.findOneAndUpdate(
            { guildId },
            { $set: { xpMultiplier: multiplier } },
            { upsert: true }
        );

        return msgOrInteraction.createFollowup({
            embed: {
                title: translate("SETXPMULTIPLIER_TITLE", lang),
                description: translate("SETXPMULTIPLIER_UPDATED", lang, {
                    multiplier: multiplier.toFixed(1)
                }),
                color: 0x3498db
            }
        });
    }
};
