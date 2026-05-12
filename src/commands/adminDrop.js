const DropEngine = require("../utils/DropEngine");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => ({ tr: tr[keyname] });

module.exports = {
    name: "drop",
    aliases: ["admindrop", "admin-drop", "kutu"],
    displayName: "CMD_NAME_ADMINDROP",
    description: "CMD_DESC_ADMINDROP",
    permLevel: 4,

    slashCommand: {
        name: "admindrop",
        name_localizations: getLocalization("CMD_NAME_ADMINDROP"),
        description: en.CMD_DESC_ADMINDROP,
        description_localizations: getLocalization("CMD_DESC_ADMINDROP"),
        options: [
            {
                name: "type",
                name_localizations: { tr: "tur" },
                description: en.ADMINDROP_OPTION_TYPE,
                description_localizations: getLocalization("ADMINDROP_OPTION_TYPE"),
                type: 3,
                required: true,
                choices: [
                    { name: "XP", value: "xp" },
                    { name: "Promo Code", value: "promo", name_localizations: { tr: "Promo Kod" } }
                ]
            },
            {
                name: "value",
                name_localizations: { tr: "deger" },
                description: en.ADMINDROP_OPTION_VALUE,
                description_localizations: getLocalization("ADMINDROP_OPTION_VALUE"),
                type: 3,
                required: true
            },
            {
                name: "itemname",
                name_localizations: { tr: "esyaadi" },
                description: en.ADMINDROP_OPTION_ITEMNAME,
                description_localizations: getLocalization("ADMINDROP_OPTION_ITEMNAME"),
                type: 3,
                required: false
            },
            {
                name: "channel",
                name_localizations: { tr: "kanal" },
                description: en.ADMINDROP_OPTION_CHANNEL,
                description_localizations: getLocalization("ADMINDROP_OPTION_CHANNEL"),
                type: 7,
                channel_types: [0],
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        if (!msgOrInteraction.acknowledge) {
            return bot.createMessage(msgOrInteraction.channel.id, translate("SLASH_ONLY", lang));
        }

        const options = msgOrInteraction.data?.options || [];
        const type = options.find((option) => option.name === "type")?.value || null;
        const value = options.find((option) => option.name === "value")?.value || null;
        const itemName = options.find((option) => option.name === "itemname")?.value || null;
        const channelId = options.find((option) => option.name === "channel")?.value || msgOrInteraction.channel.id;

        if (!type || !value) {
            return msgOrInteraction.createMessage({
                content: translate("ADMINDROP_MISSING_FIELDS", lang),
                flags: 64
            });
        }

        if (!["xp", "promo"].includes(type)) {
            return msgOrInteraction.createMessage({
                content: translate("ADMINDROP_INVALID_TYPE", lang),
                flags: 64
            });
        }

        let parsedValue = value;
        if (type === "xp") {
            parsedValue = Number(value);

            if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
                return msgOrInteraction.createMessage({
                    content: translate("ADMINDROP_INVALID_AMOUNT", lang),
                    flags: 64
                });
            }

            parsedValue = Math.floor(parsedValue);
        }

        await DropEngine.spawnDrop(bot, channelId, {
            type,
            value: parsedValue,
            itemName
        }, lang);

        return msgOrInteraction.createMessage({
            content: translate("ADMINDROP_SUCCESS", lang, { channel: channelId }),
            flags: 64
        });
    }
};
