const Guild = require("../database/models/Guild");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");
const translate = require("../utils/Translate");

const getLocalization = (keyname) => ({ tr: tr[keyname] });

module.exports = {
    name: "setlevelchannel",
    aliases: ["levelkanal-ayarla", "setlevelkanal", "set-level", "level-ayarla"],
    displayName: "CMD_NAME_SETLEVELCHANNEL",
    description: "CMD_DESC_SETLEVELCHANNEL",
    permLevel: 4,

    slashCommand: {
        name: "setlevelchannel",
        description: en.CMD_DESC_SETLEVELCHANNEL,
        description_localizations: getLocalization("CMD_DESC_SETLEVELCHANNEL"),
        options: [
            {
                name: "kanal",
                name_localizations: { en: "channel" },
                description: en.SETLEVELCHANNEL_OPTION_CHANNEL,
                description_localizations: getLocalization("SETLEVELCHANNEL_OPTION_CHANNEL"),
                type: 7,
                channel_types: [0],
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        if (!msgOrInteraction.acknowledge) return;

        const channelOption = msgOrInteraction.data?.options?.find((option) => option.name === "kanal") || null;
        const guildId = msgOrInteraction.guildID;

        if (!guildId) {
            return msgOrInteraction.createMessage({
                content: translate("SETLEVELCHANNEL_INVALID", lang),
                flags: 64
            });
        }

        await msgOrInteraction.acknowledge();

        const newChannelId = channelOption ? channelOption.value : null;

        await Guild.findOneAndUpdate(
            { guildId },
            { $set: { levelLogChannel: newChannelId } },
            { upsert: true }
        );

        const statusText = newChannelId
            ? translate("SETLEVELCHANNEL_STATUS_SET", lang, { channel: newChannelId })
            : translate("SETLEVELCHANNEL_STATUS_RESET", lang);

        return msgOrInteraction.createFollowup({
            embed: {
                title: translate("SETLEVELCHANNEL_TITLE", lang),
                description: statusText,
                color: 0x2ecc71
            }
        });
    }
};
