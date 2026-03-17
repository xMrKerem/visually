const User = require("../database/models/User");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => {
    return { "tr": tr[keyname] };
}

module.exports = {
    name: "inventory",
    description: "CMD_DESC_INVENTORY",
    displayName: "CMD_NAME_INVENTORY",
    aliases: ["çanta", "envanter", "inv", "bag", "env", "inv"],
    permLevel: 0,

    slashCommand: {
        name: "inventory",
        name_localizations: getLocalization("CMD_NAME_INVENTORY"),
        description: en.CMD_DESC_INVENTORY,
        description_localizations: getLocalization("CMD_DESC_INVENTORY"),
        type: 1,
        options: [
            {
                name: "user",
                description: "Whose inventory do you want to see?",
                description_localizations: { "tr": "Kimin envanterine bakmak istiyorsun?" },
                type: 6,
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en"

        let targetUser;

        if (msgOrInteraction.data && msgOrInteraction.data.options && msgOrInteraction.data.options[0]) {
            const targetId = msgOrInteraction.data.options[0].value;
            targetUser = bot.users.get(targetId) || await bot.getRESTUser(targetId);
        }
        else if (msgOrInteraction.mentions && msgOrInteraction.mentions.length > 0) {
            targetUser = msgOrInteraction.mentions[0];
        }
        else {
            targetUser = msgOrInteraction.member ? msgOrInteraction.member.user : msgOrInteraction.author;
        }

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                await msgOrInteraction.createMessage(payload);
                return await msgOrInteraction.getOriginalMessage();
            } else {
                return await bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        }

        const user = await User.findOne({ userId: targetUser.id });

        if (!user || !user.inventory || !user.inventory.length) {
            return reply({
                embed: {
                    title: "🎒 " + targetUser.username + translate("INVENTORY_TITLE", lang),
                    description: translate("INVENTORY_EMPTY", lang),
                    color: 0xe74c3c,
                }
            });
        }

        const equippedIds = user.equipment ? Object.values(user.equipment).filter(id => id !== null) : [];

        const ITEMS_PER_PAGE = 5;
        const totalPages = Math.ceil(user.inventory.length / ITEMS_PER_PAGE);
        let currentPage = 0;

        const generatePagePayload = (pageIndex) => {
            const start = pageIndex * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const currentItems = user.inventory.slice(start, end);

            const itemsList = currentItems.map((item, index) => {
                let limitText = item.usageLimit === -1 ? "∞" : item.usageLimit === -2 ? translate("DISPOSABLE", lang) : item.usageLimit;
                if (item.category === "chest") {
                    limitText = translate("DISPOSABLE", lang);
                }

                const itemName = item.name?.[lang] || item.name?.en || item.name?.tr || item.name || "Unknown Item";
                const itemIdText = item.itemId ? ` \`${item.itemId}\`` : "";
                const isEquipped = equippedIds.includes(item.itemId);
                const equippedBadge = isEquipped ? (lang === "tr" ? " ✅ **[Takılı]**" : " ✅ **[Equipped]**") : "";

                return `**${start + index + 1}.** ${itemName}${itemIdText}${equippedBadge} \n└ 📦 ${translate("AMOUNT", lang)}: **${item.amount}** | 🔄 ${translate("LIMIT", lang)}: **${limitText}**`;
            }).join("\n\n");

            const payload = {
                embed: {
                    title: `🎒 ${targetUser.username}` + translate("INVENTORY_TITLE", lang),
                    description: itemsList,
                    color: 0x2ecc71,
                    fields: [
                        {
                            name: "💰" + translate("WALLET", lang),
                            value: `**${user.balance}** Coin`,
                            inline: true
                        },
                        {
                            name: translate("TOTAL_ITEM", lang),
                            value: `**${user.inventory.length}** ${translate("PIECE", lang)}`,
                            inline: true
                        }
                    ],
                    thumbnail: { url: bot.user.dynamicAvatarURL("png", 256) },
                    footer: { text: lang === "tr" ? `Sayfa ${pageIndex + 1} / ${totalPages}` : `Page ${pageIndex + 1} / ${totalPages}` }
                },
                components: []
            };

            if (totalPages > 1) {
                payload.components = [{
                    type: 1,
                    components: [
                        { type: 2, style: 1, custom_id: "inv_prev", label: "⬅️", disabled: pageIndex === 0 },
                        { type: 2, style: 1, custom_id: "inv_next", label: "➡️", disabled: pageIndex === totalPages - 1 }
                    ]
                }];
            }

            return payload;
        };

        const sentMsg = await reply(generatePagePayload(currentPage));

        if (totalPages <= 1 || !sentMsg) return;

        const authorId = msgOrInteraction.author ? msgOrInteraction.author.id : msgOrInteraction.member.id;

        const buttonListener = async (interaction) => {
            if (interaction.message.id !== sentMsg.id) return;

            if (interaction.member.id !== authorId) {
                return interaction.createMessage({ content: translate("NOT_YOUR_MENU", lang), flags: 64 });
            }

            if (interaction.data.custom_id === "inv_prev" && currentPage > 0) {
                currentPage--;
            } else if (interaction.data.custom_id === "inv_next" && currentPage < totalPages - 1) {
                currentPage++;
            }

            await interaction.acknowledge();
            await interaction.editParent(generatePagePayload(currentPage));

            clearTimeout(timeoutTimer);
            timeoutTimer = setTimeout(endListener, 60000);
        };

        bot.on("interactionCreate", buttonListener);

        const endListener = () => {
            bot.removeListener("interactionCreate", buttonListener);
            const finalPayload = generatePagePayload(currentPage);
            finalPayload.components = [];
            bot.editMessage(sentMsg.channel.id, sentMsg.id, finalPayload).catch(() => {});
        };

        let timeoutTimer = setTimeout(endListener, 60000);
    }
}