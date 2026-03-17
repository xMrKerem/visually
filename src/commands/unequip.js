const User = require("../database/models/User");
const StoreItem = require("../database/models/StoreItem");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return { "tr": tr[keyname] };
}

module.exports = {
    name: "unequip",
    description: "CMD_DESC_UNEQUIP",
    displayName: "CMD_NAME_UNEQUIP",
    aliases: ["çıkar", "cikar", "soy", "unwear"],
    permLevel: 0,

    slashCommand: {
        name: "unequip",
        name_localizations: getLocalization("CMD_NAME_UNEQUIP"),
        description: en.CMD_DESC_UNEQUIP || "Unequip an item from a slot",
        description_localizations: getLocalization("CMD_DESC_UNEQUIP"),
        type: 1,
        options: [
            {
                name: "slot",
                description: "The slot to unequip",
                description_localizations: getLocalization("SLASH_DESC_UNEQUIP_SLOT"),
                type: 3,
                required: true,
                choices: [
                    { name: "⚔️ Weapon", value: "weapon" },
                    { name: "🛡️ Shield", value: "shield" },
                    { name: "🟣 Tech", value: "tech" },
                    { name: "💖 Heal", value: "heal" }
                ]
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const userId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id;

        let slotKey = "";
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            slotKey = msgOrInteraction.data.options[0].value;
        } else if (args && args.length > 0) {
            slotKey = args[0].toLowerCase();
        }

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return await msgOrInteraction.createMessage(payload);
            } else {
                return await bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        if (!slotKey) return reply({ content: translate("UNEQUIP_NO_ARG", lang) });

        const validSlots = ["weapon", "shield", "tech", "heal"];
        if (!validSlots.includes(slotKey)) return reply({ content: translate("INVALID_SLOT", lang) });

        const user = await User.findOne({ userId: userId });

        if (!user || !user.equipment || !user.equipment[slotKey]) {
            return reply({
                content: translate("UNEQUIP_EMPTY", lang).replace("{slot}", translate("CAT_" + slotKey.toUpperCase(), lang))
            });
        }

        const currentItemId = user.equipment[slotKey];
        const storeItem = await StoreItem.findOne({ itemId: currentItemId });

        user.equipment[slotKey] = null;
        user.markModified("equipment");
        await user.save();

        const itemName = storeItem ? (storeItem.name[lang] || storeItem.name["en"]) : "Item";
        const itemEmoji = storeItem?.emoji || "📦";
        const slotName = translate("CAT_" + slotKey.toUpperCase(), lang);

        return reply({
            embed: {
                title: "✅ " + (translate("UNEQUIPPED_TITLE", lang) || "Başarıyla Çıkarıldı"),
                description: translate("UNEQUIP_SUCCESS", lang)
                    .replace("{item}", `${itemEmoji} ${itemName}`)
                    .replace("{slot}", slotName),
                color: 0xe74c3c,
            }
        });
    }
};