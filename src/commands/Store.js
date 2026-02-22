const StoreItem = require("../database/models/Store");
const User = require("../database/models/User");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return {
        "tr": tr[keyname],
    }
}

module.exports = {
    name: "store",
    description: "CMD_DESC_STORE",
    displayName: "CMD_NAME_STORE",
    aliases: ["mağaza", "market", "dükkan", "shop"],
    permLevel: 0,

    slashCommand: {
        name: "store",
        name_localizations: getLocalization("CMD_NAME_STORE"),
        description: en.CMD_DESC_STORE,
        description_localizations: getLocalization("CMD_DESC_STORE"),
        type: 1,
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en"

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                await msgOrInteraction.createMessage(payload);
                return await msgOrInteraction.getOriginalMessage();
            } else {
                return await bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        return reply({
            content: translate("STORE_COMMING_SOON", lang)
        })

        const generateStoreComponents = (currentCategory, currentPage, maxPages, currentItem) => {
            const selectMenuRow = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "STORE_CATEGORY_SELECT",
                    placeholder: translate("STORE_CATEGORY_PLACEHOLDER", lang),
                    options: [
                        {
                            label: translate("STORE_MAIN", lang),
                            description: translate("STORE_MAIN_DESC", lang),
                            emoji: { name: "🏠" },
                            value: "main",
                            default: currentCategory === "main"
                        },
                        {
                            label: translate("STORE_SHIELD", lang),
                            description: translate("STORE_SHIELD_DESC", lang),
                            emoji: { name: "🛡️" },
                            value: "shield",
                            default: currentCategory === "shield"
                        },
                        {
                            label: translate("STORE_EQUIP", lang),
                            description: translate("STORE_EQUIP_DESC", lang),
                            emoji: { name: "⚔️" },
                            value: "equip",
                            default: currentCategory === "equip"
                        },
                        {
                            label: translate("STORE_TECH", lang),
                            description: translate("STORE_TECH_DESC", lang),
                            emoji: { name: "🟣" },
                            value: "tech",
                            default: currentCategory === "tech"
                        }
                    ]
                }]
            }

            const isMain = currentCategory === "main"
            const disabledPrev = isMain || currentPage <= 1
            const disabledNext = isMain || currentPage >= maxPages

            const buttonsRow = {
                type: 1,
                components: [
                    { type: 2, style: 2, emoji: { name: "⏪" }, custom_id: "first", disabled: disabledPrev },
                    { type: 2, style: 1, emoji: { name: "◀️" }, custom_id: "backward", disabled: disabledPrev },
                    { type: 2, style: 3, emoji: { name: "🛒" }, label: translate("BUY", lang), custom_id: currentItem ? `buy_${currentItem.itemId}` : "buy_none", disabled: !currentItem },
                    { type: 2, style: 1, emoji: { name: "▶️" }, custom_id: "forward", disabled: disabledNext },
                    { type: 2, style: 2, emoji: { name: "⏩" }, custom_id: "last", disabled: disabledNext },
                ]
            }
            return [selectMenuRow, buttonsRow]
        }

        const updateStore = async (category, page) => {
            let embed = { color: 0x2b2d31 };
            let currentItem = null;
            let max = 1;
            const components = generateStoreComponents(category, page, max, currentItem);

            return { embed, components, maxPages: max };
        };

        const listener = async (interaction) => {
            if (!message || !interaction.message || interaction.message.id !== message.id) return

            const commandUserId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id
            const clickerId = (interaction.member || interaction.user).id

            if (clickerId !== commandUserId) {
                return interaction.createMessage({
                    content: translate("NOT_USER", lang),
                    flags: 64
                })
            }
            await interaction.deferUpdate()

            storeData = await updateStore(currentCategory, currentPage);
            maxPages = storeData.maxPages;

            await interaction.editOriginalMessage({
                embed: storeData.embed,
                components: storeData.components
            });
        }

        bot.on("interactionCreate", listener);

        setTimeout(() => {
            bot.removeListener("interactionCreate", listener);
            try { bot.editMessage(message.channel.id, message.id, { components: [] }); } catch(e) {}
        }, 120000);
    }
}