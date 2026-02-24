const StoreItem = require("../database/models/StoreItem");
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

        /*return reply({
            content: translate("STORE_COMMING_SOON", lang)
        })*/

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
                        },
                        {
                            label: translate("STORE_HEAL", lang),
                            description: translate("STORE_HEAL_DESC", lang),
                            emoji: { name: "💖" },
                            value: "heal",
                            default: currentCategory === "heal"
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
            let embed = { color: 0x2b2d31 }
            let currentItem = null;
            let max = 1;

            if (category === "main") {
                embed.title = translate("STORE_MAIN", lang);
                embed.description = translate("STORE_MAIN_DESC", lang);
                embed.thumbnail = { url: bot.user.dynamicAvatarURL("png", 256) }
            } else {
                const items = await StoreItem.find({ category: category }).sort({ price: 1 })
                max = items.length > 0 ? items.length : 1
                currentItem = items[ page - 1 ]

                embed.title = currentItem.emoji + currentItem.name[lang]
                embed.description = currentItem.description[lang]
                embed.fields = [
                    {
                        name: translate("PRICE", lang),
                        value: `${currentItem.price} Coin`,
                        inline: true,
                    },
                    {
                        name: translate("POWER", lang),
                        value: `**${currentItem.maxPower} - ${currentItem.minPower}**`,
                        inline: true,
                    },
                    {
                        name: translate("LIMIT", lang),
                        value: currentItem.usageLimit === -1 ? "**∞**" : `**${currentItem.usageLimit}**`,
                        inline: true,
                    }
                ]
                embed.image = { url: currentItem.image }
                embed.footer = { text: `${translate("STORE_FOOTER", lang)} ${page}/${max}` }
            }

            const components = generateStoreComponents(category, page, max, currentItem);
            return { embed, components, maxPages: max };
        };

        let currentCategory = "main"
        let currentPage = 1
        let storeData = await updateStore(currentCategory, currentPage)
        let maxPages = storeData.maxPages

        const message = await reply({
            embed: storeData.embed,
            components: storeData.components
        })

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

            if (interaction.data.custom_id.startsWith("buy_")) {
                const itemId = interaction.data.custom_id.split("_")[1]
                const user = await User.findOne({ userId: clickerId })
                const item = await StoreItem.findOne({ itemId: itemId })

                if (!user || !item) {
                    return interaction.createMessage({ content: translate("NOT_USER_OR_ITEM", lang), flags: 64 })
                }

                if (user.balance < item.price) {
                    return interaction.createMessage({ content: translate("ENOUGH_BALANCE", lang), flags: 64 })
                }

                const alreadyHas = user.inventory.find(i => i.itemId === item.itemId)
                if (item.usageLimit === -1 && alreadyHas) {
                    return interaction.createMessage({ content: translate("ITEM_OWNED", lang), flags: 64 })
                }

                user.balance -= item.price

                if (alreadyHas) {
                    alreadyHas.amount += 1
                } else {
                    user.inventory.push({
                        itemId: item.itemId,
                        name: item.name[lang],
                        usageLimit: item.usageLimit,
                        amount: 1
                    })
                }

                user.markModified("inventory")
                await user.save()
                return interaction.createMessage({ content: translate("SUC", lang), flags: 64 })
            }

            await interaction.deferUpdate()

            if (interaction.data.custom_id.startsWith("STORE_CATEGORY_SELECT")) {
                currentCategory = interaction.data.values[0]
                currentPage = 1
            } else {
                if (interaction.data.custom_id === "forward") currentPage += 1
                if (interaction.data.custom_id === "backward") currentPage -= 1
                if (interaction.data.custom_id === "last") currentPage = maxPages
                if (interaction.data.custom_id === "first") currentPage = 1
            }

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