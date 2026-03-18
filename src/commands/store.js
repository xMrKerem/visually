const StoreItem = require("../database/models/StoreItem");
const User = require("../database/models/User");
const translate = require("../utils/Translate");
const { claimVoteChest, getVoteUrl, hasUnclaimedVote } = require("../utils/TopggVoteSystem");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return {
        tr: tr[keyname],
    };
};

const formatPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

const getRarityLabel = (rarity, lang) => {
    if (!rarity) return "-";
    return translate(`RARITY_${String(rarity).toUpperCase()}`, lang);
};

const getItemFields = (item, category, lang) => {
    const stats = item.stats || {};
    const fields = [
        {
            name: translate("PRICE", lang),
            value: `${item.price} ${translate("COIN", lang)}`,
            inline: true,
        }
    ];

    if (category === "weapon") {
        fields.push({
            name: translate("ATTACK_RANGE", lang),
            value: `**${stats.atcMinDmg ?? 0} - ${stats.atcMaxDmg ?? 0}**`,
            inline: true,
        });

        if (typeof stats.dmgCritChance === "number") {
            fields.push({
                name: translate("CRIT_CHANCE", lang),
                value: `**${formatPercent(stats.dmgCritChance)}**`,
                inline: true,
            });
        }
    } else if (category === "shield") {
        fields.push({
            name: translate("DEFENSE", lang),
            value: `**x${Number(stats.defense ?? 1).toFixed(2)}**`,
            inline: true,
        });

        if (typeof stats.bonusHp === "number" && stats.bonusHp > 0) {
            fields.push({
                name: translate("BONUS_HP", lang),
                value: `**+${stats.bonusHp}**`,
                inline: true,
            });
        }
    } else if (category === "tech") {
        if (typeof stats.dmgCritChance === "number") {
            fields.push({
                name: translate("CRIT_CHANCE", lang),
                value: `**${formatPercent(stats.dmgCritChance)}**`,
                inline: true,
            });
        }

        if (typeof stats.spcCritChance === "number") {
            fields.push({
                name: translate("SPECIAL_CRIT_CHANCE", lang),
                value: `**${formatPercent(stats.spcCritChance)}**`,
                inline: true,
            });
        }
    } else if (category === "heal") {
        if (stats.respawn) {
            fields.push({
                name: translate("EFFECT", lang),
                value: `**${translate("REVIVE_EFFECT", lang)}**`,
                inline: true,
            });
        } else if (typeof stats.minHp === "number" || typeof stats.maxHp === "number") {
            fields.push({
                name: translate("HEAL", lang),
                value: `**${stats.minHp ?? 0} - ${stats.maxHp ?? 0} ${translate("HP", lang)}**`,
                inline: true,
            });
        }
    } else if (category === "chest") {
        const totalItems = Array.isArray(stats.contents) ? stats.contents.length : 0;
        fields.push({
            name: translate("TOTAL_ITEM", lang),
            value: `**${totalItems}**`,
            inline: true,
        });
    }

    fields.push({
        name: translate("RARITY", lang),
        value: `**${getRarityLabel(item.rarity, lang)}**`,
        inline: true,
    });

    fields.push({
        name: translate("LIMIT", lang),
        value: item.usageLimit === -1 ? "**\u221E**" : item.usageLimit === -2 ? translate("DISPOSABLE", lang) : `**${item.usageLimit}**`,
        inline: true,
    });

    return fields;
};

const getVoteChestComponents = (bot, lang) => [{
    type: 1,
    components: [
        { type: 2, style: 5, label: translate("BTN_VOTE_NOW", lang), url: getVoteUrl(bot.user.id) },
        { type: 2, style: 1, label: translate("BTN_CHECK_VOTE", lang), custom_id: "check_vote_reward" }
    ]
}];

module.exports = {
    name: "store",
    description: "CMD_DESC_STORE",
    displayName: "CMD_NAME_STORE",
    aliases: ["ma\u011Faza", "market", "d\u00FCkkan", "shop"],
    permLevel: 0,

    slashCommand: {
        name: "store",
        name_localizations: getLocalization("CMD_NAME_STORE"),
        description: en.CMD_DESC_STORE,
        description_localizations: getLocalization("CMD_DESC_STORE"),
        type: 1,
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                await msgOrInteraction.createMessage(payload);
                return await msgOrInteraction.getOriginalMessage();
            }

            return await bot.createMessage(msgOrInteraction.channel.id, payload);
        };

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
                            emoji: { name: "\uD83C\uDFE0" },
                            value: "main",
                            default: currentCategory === "main"
                        },
                        {
                            label: translate("STORE_SHIELD", lang),
                            description: translate("STORE_SHIELD_DESC", lang),
                            emoji: { name: "\uD83D\uDEE1\uFE0F" },
                            value: "shield",
                            default: currentCategory === "shield"
                        },
                        {
                            label: translate("STORE_EQUIP", lang),
                            description: translate("STORE_EQUIP_DESC", lang),
                            emoji: { name: "\u2694\uFE0F" },
                            value: "weapon",
                            default: currentCategory === "weapon"
                        },
                        {
                            label: translate("STORE_TECH", lang),
                            description: translate("STORE_TECH_DESC", lang),
                            emoji: { name: "\uD83D\uDFE3" },
                            value: "tech",
                            default: currentCategory === "tech"
                        },
                        {
                            label: translate("STORE_HEAL", lang),
                            description: translate("STORE_HEAL_DESC", lang),
                            emoji: { name: "\uD83D\uDC96" },
                            value: "heal",
                            default: currentCategory === "heal"
                        },
                        {
                            label: translate("STORE_CHEST", lang),
                            description: translate("STORE_CHEST_DESC", lang),
                            emoji: { name: "\uD83E\uDDF0" },
                            value: "chest",
                            default: currentCategory === "chest"
                        }
                    ]
                }]
            };

            const isMain = currentCategory === "main";
            const disabledPrev = isMain || currentPage <= 1;
            const disabledNext = isMain || currentPage >= maxPages;

            const buttonsRow = {
                type: 1,
                components: [
                    { type: 2, style: 2, emoji: { name: "\u23EA" }, custom_id: "first", disabled: disabledPrev },
                    { type: 2, style: 1, emoji: { name: "\u25C0\uFE0F" }, custom_id: "backward", disabled: disabledPrev },
                    { type: 2, style: 3, emoji: { name: "\uD83D\uDED2" }, label: translate("BUY", lang), custom_id: currentItem ? `buy_${currentItem.itemId}` : "buy_none", disabled: !currentItem },
                    { type: 2, style: 1, emoji: { name: "\u25B6\uFE0F" }, custom_id: "forward", disabled: disabledNext },
                    { type: 2, style: 2, emoji: { name: "\u23E9" }, custom_id: "last", disabled: disabledNext },
                ]
            };
            return [selectMenuRow, buttonsRow];
        };

        const updateStore = async (category, page) => {
            const embed = { color: 0x2b2d31 };
            let currentItem = null;
            let max = 1;

            if (category === "main") {
                embed.title = translate("STORE_MAIN", lang);
                embed.description = translate("STORE_MAIN_DESC", lang);
                embed.thumbnail = { url: bot.user.dynamicAvatarURL("png", 256) };
            } else {
                const items = await StoreItem.find({
                    category,
                    isBuyable: true,
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } }
                    ]
                }).sort({ price: 1 });

                max = items.length > 0 ? items.length : 1;
                currentItem = items[page - 1];

                if (items.length === 0) {
                    embed.title = translate("STORE_EMPTY", lang);
                    embed.description = translate("STORE_EMPTY_DESC", lang);
                } else {
                    const rarityColors = {
                        common: 0x2ecc71,
                        rare: 0x3498db,
                        epic: 0x9b59b6,
                        legendary: 0xe67e22
                    };
                    embed.color = rarityColors[currentItem.rarity] || 0x2b2d31;

                    embed.title = `${currentItem.emoji} ${currentItem.name[lang] || currentItem.name.en}`;
                    embed.description = currentItem.description[lang] || currentItem.description.en;
                    embed.fields = getItemFields(currentItem, category, lang);

                    if (currentItem.image) embed.image = { url: currentItem.image };
                    embed.footer = { text: `${translate("STORE_FOOTER", lang)} ${page}/${max}` };
                }
            }

            const components = generateStoreComponents(category, page, max, currentItem);
            return { embed, components, maxPages: max };
        };

        let currentCategory = "main";
        let currentPage = 1;
        let storeData = await updateStore(currentCategory, currentPage);
        let maxPages = storeData.maxPages;

        const message = await reply({
            embed: storeData.embed,
            components: storeData.components
        });

        const listener = async (interaction) => {
            if (!message || !interaction.message || interaction.message.id !== message.id) return;

            const commandUserId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id;
            const clickerId = (interaction.member || interaction.user).id;

            if (clickerId !== commandUserId) {
                return interaction.createMessage({
                    content: translate("NOT_USER", lang),
                    flags: 64
                });
            }

            if (interaction.data.custom_id === "check_vote_reward") {
                let user = await User.findOne({ userId: clickerId });
                const voteChest = await StoreItem.findOne({ itemId: "VOTE", category: "chest" });

                if (!user || !voteChest) {
                    return interaction.createMessage({ content: translate("NOT_USER_OR_ITEM", lang), flags: 64 });
                }

                if (!hasUnclaimedVote(user)) {
                    return interaction.createMessage({
                        content: translate("VOTE_CHEST_PENDING", lang),
                        components: getVoteChestComponents(bot, lang),
                        flags: 64
                    });
                }

                const claimed = await claimVoteChest(user, voteChest);
                if (!claimed) {
                    return interaction.createMessage({ content: translate("VOTE_CHEST_PENDING", lang), flags: 64 });
                }

                return interaction.createMessage({
                    content: translate("VOTE_CHEST_CLAIMED", lang, { item: voteChest.name[lang] || voteChest.name.en }),
                    flags: 64
                });
            }

            if (interaction.data.custom_id.startsWith("buy_")) {
                const itemId = interaction.data.custom_id.split("_")[1];
                const user = await User.findOne({ userId: clickerId });
                const item = await StoreItem.findOne({ itemId });

                if (!user || !item) {
                    return interaction.createMessage({ content: translate("NOT_USER_OR_ITEM", lang), flags: 64 });
                }

                if (item.itemId === "VOTE") {
                    if (hasUnclaimedVote(user)) {
                        const claimed = await claimVoteChest(user, item);
                        if (claimed) {
                            return interaction.createMessage({
                                content: translate("VOTE_CHEST_CLAIMED", lang, { item: item.name[lang] || item.name.en }),
                                flags: 64
                            });
                        }
                    }

                    return interaction.createMessage({
                        embed: {
                            title: translate("VOTE_CHEST_TITLE", lang),
                            description: translate("VOTE_CHEST_DESC", lang),
                            color: 0x5865f2
                        },
                        components: getVoteChestComponents(bot, lang),
                        flags: 64
                    });
                }

                if (user.balance < item.price) {
                    return interaction.createMessage({ content: translate("ENOUGH_BALANCE", lang), flags: 64 });
                }

                const alreadyHas = user.inventory.find((i) => i.itemId === item.itemId);
                if (item.usageLimit === -1 && alreadyHas && item.category !== "chest") {
                    return interaction.createMessage({ content: translate("ITEM_OWNED", lang), flags: 64 });
                }

                user.balance -= item.price;

                if (alreadyHas) {
                    alreadyHas.amount += 1;
                } else {
                    user.inventory.push({
                        itemId: item.itemId,
                        name: item.name,
                        usageLimit: item.usageLimit,
                        amount: 1,
                        category: item.category,
                        rarity: item.rarity
                    });
                }

                user.markModified("inventory");
                await user.save();
                return interaction.createMessage({ content: translate("SUC", lang), flags: 64 });
            }

            await interaction.deferUpdate();

            if (interaction.data.custom_id.startsWith("STORE_CATEGORY_SELECT")) {
                currentCategory = interaction.data.values[0];
                currentPage = 1;
            } else {
                if (interaction.data.custom_id === "forward") currentPage += 1;
                if (interaction.data.custom_id === "backward") currentPage -= 1;
                if (interaction.data.custom_id === "last") currentPage = maxPages;
                if (interaction.data.custom_id === "first") currentPage = 1;
            }

            storeData = await updateStore(currentCategory, currentPage);
            maxPages = storeData.maxPages;

            await interaction.editOriginalMessage({
                embed: storeData.embed,
                components: storeData.components
            });
        };

        bot.on("interactionCreate", listener);

        setTimeout(() => {
            bot.removeListener("interactionCreate", listener);
            try {
                bot.editMessage(message.channel.id, message.id, { components: [] });
            } catch (e) {}
        }, 120000);
    }
};