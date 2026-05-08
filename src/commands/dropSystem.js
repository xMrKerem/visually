const Guild = require("../database/models/Guild");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => ({ tr: tr[keyname] });

module.exports = {
    name: "setdrop",
    aliases: ["toggledrop", "dropaç", "dropkapat", "dropayar"],
    displayName: "CMD_NAME_DROPSYSTEM",
    description: "CMD_DESC_DROPSYSTEM",
    permLevel: 4,

    slashCommand: {
        name: "dropsystem",
        name_localizations: { tr: tr.CMD_NAME_DROPSYSTEM },
        description: en.CMD_DESC_DROPSYSTEM,
        description_localizations: getLocalization("CMD_DESC_DROPSYSTEM"),
        options: [
            {
                name: "status",
                name_localizations: { tr: "durum" },
                description: en.DROPSYSTEM_OPTION_STATUS,
                description_localizations: getLocalization("DROPSYSTEM_OPTION_STATUS"),
                type: 5,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const isSlash = Boolean(msgOrInteraction.acknowledge);
        let isEnabled;

        const reply = async (payload) => {
            if (isSlash) {
                try {
                    if (!msgOrInteraction.acknowledged) {
                        await msgOrInteraction.acknowledge();
                    }
                    return await msgOrInteraction.createFollowup(payload);
                } catch (e) {
                    return null;
                }
            }

            return await bot.createMessage(msgOrInteraction.channel.id, payload);
        };

        if (isSlash) {
            const statusOption = msgOrInteraction.data?.options?.find((option) => option.name === "status");
            isEnabled = statusOption ? statusOption.value : null;
        } else {
            if (!args || args.length === 0) {
                return reply({ content: translate("DROPSYSTEM_MISSING_STATUS", lang) });
            }

            const value = String(args[0]).toLowerCase();
            if (["aç", "ac", "true", "on", "aktif"].includes(value)) {
                isEnabled = true;
            } else if (["kapat", "false", "off", "pasif"].includes(value)) {
                isEnabled = false;
            } else {
                return reply({ content: translate("DROPSYSTEM_INVALID_STATUS", lang) });
            }
        }

        if (typeof isEnabled !== "boolean") {
            return reply({ content: translate("DROPSYSTEM_INVALID_STATUS", lang) });
        }

        try {
            const guildId = msgOrInteraction.guildID || msgOrInteraction.channel?.guild?.id || null;
            if (!guildId) {
                return reply({ content: translate("DROPSYSTEM_GUILD_ERROR", lang), flags: 64 });
            }

            await Guild.findOneAndUpdate(
                { guildId },
                { $set: { isDropsEnabled: isEnabled } }
            );

            const statusText = isEnabled
                ? translate("DROPSYSTEM_ENABLED_STATUS", lang)
                : translate("DROPSYSTEM_DISABLED_STATUS", lang);

            return reply({
                embed: {
                    title: translate("DROPSYSTEM_TITLE", lang),
                    description: translate("DROPSYSTEM_UPDATED", lang, { status: statusText }),
                    color: isEnabled ? 0x2ecc71 : 0xe74c3c
                }
            });
        } catch (err) {
            console.error("[Drop Toggle Command] DB HatasÄ±:", err);
            return reply({ content: translate("DROPSYSTEM_SAVE_ERROR", lang), flags: 64 });
        }
    }
};
