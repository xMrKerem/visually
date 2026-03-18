const User = require("../database/models/User");
const StoreItem = require("../database/models/StoreItem");
const translate = require("../utils/Translate");
const { getInventoryItemName, openChest } = require("../utils/ChestSystem");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return { tr: tr[keyname] };
};

const normalizeText = (text = "") => String(text).trim().toLowerCase();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    name: "openchest",
    description: "CMD_DESC_OPENCHEST",
    displayName: "CMD_NAME_OPENCHEST",
    aliases: ["sandıkaç", "chestopen", "sandık", "opencrate"],
    permLevel: 0,

    slashCommand: {
        name: "openchest",
        name_localizations: getLocalization("CMD_NAME_OPENCHEST"),
        description: en.CMD_DESC_OPENCHEST,
        description_localizations: getLocalization("CMD_DESC_OPENCHEST"),
        type: 1,
        options: [
            {
                name: "chest",
                description: en.SLASH_DESC_OPENCHEST,
                description_localizations: getLocalization("SLASH_DESC_OPENCHEST"),
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const userId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id;

        let chestInput = "";
        if (msgOrInteraction.data?.options?.[0]) {
            chestInput = msgOrInteraction.data.options[0].value;
        } else if (args?.length) {
            chestInput = args.join(" ");
        }

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                await msgOrInteraction.createMessage(payload);
                return msgOrInteraction.getOriginalMessage ? await msgOrInteraction.getOriginalMessage() : null;
            }
            return await bot.createMessage(msgOrInteraction.channel.id, payload);
        };

        if (!chestInput) {
            return reply({ content: translate("CHEST_OPEN_NO_ARG", lang), flags: 64 });
        }

        const user = await User.findOne({ userId });
        if (!user || !Array.isArray(user.inventory) || !user.inventory.length) {
            return reply({ content: translate("CHEST_NOT_IN_INV", lang), flags: 64 });
        }

        const normalized = normalizeText(chestInput);
        const inventoryChest = user.inventory.find((item) => {
            if (item.category !== "chest") return false;
            if (normalizeText(item.itemId) === normalized) return true;

            const trName = getInventoryItemName(item, "tr");
            const enName = getInventoryItemName(item, "en");
            return normalizeText(trName).includes(normalized) || normalizeText(enName).includes(normalized);
        });

        if (!inventoryChest) {
            return reply({ content: translate("CHEST_NOT_IN_INV", lang), flags: 64 });
        }

        const trName = getInventoryItemName(inventoryChest, "tr");
        const enName = getInventoryItemName(inventoryChest, "en");

        const chestStoreItem = await StoreItem.findOne({
            category: "chest",
            $or: [
                { itemId: inventoryChest.itemId },
                { "name.tr": trName },
                { "name.en": enName }
            ]
        });

        if (!chestStoreItem) {
            return reply({ content: translate("CHEST_NOT_FOUND", lang), flags: 64 });
        }

        try {
            const chestName = chestStoreItem.name[lang] || chestStoreItem.name.en;
            const openingImage = chestStoreItem.openGif || chestStoreItem.image || null;

            const openingPayload = {
                embed: {
                    title: translate("CHEST_OPENING_TITLE", lang),
                    description: translate("CHEST_OPENING_DESC", lang, { chest: chestName }),
                    color: 0x5865f2,
                }
            };

            if (openingImage) {
                openingPayload.embed.image = { url: openingImage };
            }

            const sentMessage = await reply(openingPayload);
            const reward = await openChest(user, chestStoreItem);
            const rewardLabel = reward.type === "coin"
                ? `${reward.amount} ${translate("COIN", lang)}`
                : `${reward.item.emoji} ${reward.item.name[lang] || reward.item.name.en}`;

            const rewardPayload = {
                embed: {
                    title: translate("CHEST_OPENED_TITLE", lang),
                    description: translate("CHEST_OPENED_DESC", lang, {
                        chest: chestName,
                        reward: rewardLabel
                    }),
                    color: 0xf1c40f
                }
            };

            if (reward.type === "item" && reward.item.image) {
                rewardPayload.embed.image = { url: reward.item.image };
            }

            if (sentMessage?.channel?.id && sentMessage?.id) {
                await wait(3000);
                await bot.editMessage(sentMessage.channel.id, sentMessage.id, rewardPayload);
                return;
            }

            return reply(rewardPayload);
        } catch (error) {
            return reply({ content: translate("CHEST_OPEN_FAIL", lang), flags: 64 });
        }
    }
};
