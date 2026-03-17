const StoreItem = require("../database/models/StoreItem");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return { "tr": tr[keyname] };
}

module.exports = {
    name: "removeitem",
    description: "CMD_DESC_REMOVEITEM",
    displayName: "CMD_NAME_REMOVEITEM",
    permLevel: 5,

    slashCommand: {
        name: "removeitem",
        name_localizations: getLocalization("CMD_NAME_REMOVEITEM"),
        description: en.CMD_DESC_REMOVEITEM || "Remove an item from the store.",
        description_localizations: getLocalization("CMD_DESC_REMOVEITEM"),
        type: 1,
        options: [
            {
                name: "id",
                description: en.SLASH_DESC_REMOVEITEM_ID || "Item ID to remove",
                description_localizations: getLocalization("SLASH_DESC_REMOVEITEM_ID"),
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        if (!msgOrInteraction.data) return;
        await msgOrInteraction.acknowledge();

        const lang = guildData ? guildData.language : "en";
        const targetId = msgOrInteraction.data.options[0].value;

        try {
            const deletedItem = await StoreItem.findOneAndDelete({ itemId: targetId });

            if (!deletedItem) {
                return msgOrInteraction.editOriginalMessage({
                    content: `❌ **${translate("ERROR", lang) }:** ` + (translate("REMOVE_NOT_FOUND", lang)).replace("{id}", targetId)
                });
            }

            const itemName = deletedItem.name && typeof deletedItem.name === 'object'
                ? (deletedItem.name[lang] || deletedItem.name["en"])
                : (deletedItem.name || "undefnied item");

            return msgOrInteraction.editOriginalMessage({
                embed: {
                    title: "🗑️ " + (translate("REMOVE_TITLE", lang)),
                    description: (translate("REMOVE_SUCCESS", lang))
                        .replace("{item}", `${deletedItem.emoji || "📦"} ${itemName}`)
                        .replace("{id}", targetId),
                    color: 0xe74c3c,
                    footer: { text: translate("REMOVE_FOOTER", lang) }
                }
            });

        } catch (err) {
            console.error(err);
            return msgOrInteraction.editOriginalMessage({ content: translate("ERROR_OCCURRED", lang) });
        }
    }
}