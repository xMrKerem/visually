const User = require("../database/models/User");
const StoreItem = require("../database/models/StoreItem");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return { "tr": tr[keyname] };
}

module.exports = {
    name: "equip",
    description: "CMD_DESC_EQUIP",
    displayName: "CMD_NAME_EQUIP",
    aliases: ["kuşan", "tak", "giy", "wear"],
    permLevel: 0,

    slashCommand: {
        name: "equip",
        name_localizations: getLocalization("CMD_NAME_EQUIP"),
        description: en.CMD_DESC_EQUIP,
        description_localizations: getLocalization("CMD_DESC_EQUIP"),
        type: 1,
        options: [
            {
                name: "item",
                description: en.SLASH_DESC_EQUIP,
                description_localizations: getLocalization("SLASH_DESC_EQUIP"),
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const userId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id;

        let inputItem = "";
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            inputItem = msgOrInteraction.data.options[0].value;
        } else if (args && args.length > 0) {
            inputItem = args.join(" ");
        }

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return await msgOrInteraction.createMessage(payload);
            } else {
                return await bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        if (!inputItem) return reply({ content: translate("EQUIP_NO_ARG", lang) });

        const user = await User.findOne({ userId: userId });
        if (!user || !user.inventory || user.inventory.length === 0) {
            return reply({ content: translate("INVENTORY_EMPTY", lang) });
        }

        const targetInvItem = user.inventory.find(i =>
            i.itemId === inputItem ||
            (typeof i.name === 'object'
                ? (i.name["tr"].toLowerCase().includes(inputItem.toLowerCase()) || i.name["en"].toLowerCase().includes(inputItem.toLowerCase()))
                : i.name.toLowerCase().includes(inputItem.toLowerCase()))
        );

        if (!targetInvItem) {
            return reply({ content: translate("ITEM_NOT_FOUND_INV", lang) });
        }

        const storeItem = await StoreItem.findOne({ itemId: targetInvItem.itemId });

        if (!storeItem) return reply({ content: translate("ITEM_DELETED_DB", lang) });
        if (!user.equipment) user.equipment = { weapon: null, shield: null, tech: null, potion: null };

        let slotName = "";
        let slotKey = "";

        if (storeItem.category === "weapon") {
            slotKey = "weapon";
            slotName = "⚔️ " + (translate("CAT_WEAPON", lang));
        } else if (storeItem.category === "shield") {
            slotKey = "shield";
            slotName = "🛡️ " + (translate("CAT_SHIELD", lang));
        } else if (storeItem.category === "tech") {
            slotKey = "tech";
            slotName = "🟣 " + (translate("CAT_TECH", lang));
        } else if (storeItem.category === "heal") {
            slotKey = "heal";
            slotName = "🧪 " + (translate("CAT_POTION", lang));
        }

        if (!slotKey) return reply({ content: translate("EQUIP_ERR", lang) });

        user.equipment[slotKey] = storeItem.itemId;

        user.markModified("equipment");
        await user.save();

        const itemName = storeItem.name[lang] || storeItem.name["en"];

        return reply({
            embed: {
                title: "✅ " + (translate("EQUIPPED_TITLE", lang)),
                description: translate("EQUIP_SUCCESS_DESC", lang)
                    .replace("{item}", `${storeItem.emoji || "📦"} ${itemName}`)
                    .replace("{slot}", slotName),
                color: 0x2ecc71,
            }
        });
    }
};