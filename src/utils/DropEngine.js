const User = require('../database/models/User');
const translate = require('./Translate');

const activeDrops = new Map();
const autoDropTracker = new Map();

module.exports = {
    spawnDrop: async (bot, channelId, payload, lang = "en") => {
        try {
            const embed = {
                title: translate("DROP_TITLE", lang),
                description: translate("DROP_DESCRIPTION", lang),
                color: 0xf1c40f,
                image: { url: "" }
            };

            const components = [{
                type: 1,
                components: [{
                    type: 2,
                    style: 3,
                    label: translate("DROP_OPEN", lang),
                    emoji: { name: "🎁" },
                    custom_id: "claim_drop"
                }]
            }]

            const dropMessage = await bot.createMessage(channelId, { embed, components });

            activeDrops.set(dropMessage.id, {
                claimed: false,
                type: payload.type,
                value: payload.value,
                itemName: payload.itemName
            });

            setTimeout(() => {
                if (activeDrops.has(dropMessage.id) && !activeDrops.get(dropMessage.id).claimed) {
                    activeDrops.delete(dropMessage.id);
                    bot.editMessage(channelId, dropMessage.id, {
                        embed: {
                            title: translate("NOT_RECEIVED_DROP_TITLE", lang),
                            description: translate("NOT_RECEIVED_DROP_DESCRIPTION", lang),
                            color: 0x95a5a6
                        },
                        components: []
                    }).catch(() => {});
                }
            }, 5 * 60 * 1000);

        } catch (err) {
            console.error("[DropEngine Error] Spawn hatası: ", err);
        }
    },

    handleInteraction: async (bot, interaction, guildData) => {
        if (interaction.data.custom_id !== "claim_drop") return;

        const messageId = interaction.message.id;
        const guildId = interaction.guildID;
        const userId = interaction.member.id;
        const lang = guildData ? guildData.language : "en";
        const dropData = activeDrops.get(messageId);

        if (!dropData) {
            return interaction.createMessage({ content: translate("NO_DROP", lang), flags: 64 });
        }

        if (dropData.claimed) {
            return interaction.createMessage({ content: translate("DROP_CLAIMED", lang), flags: 64 });
        }

        dropData.claimed = true;
        await interaction.acknowledge();
        activeDrops.set(messageId, dropData);
        let resultMessage = "";
        
        try {
            if (dropData.type === "xp") {
                const LevelSystem = require("./LevelSystem");
                const memberRoles = interaction.member?.roles || [];

                await LevelSystem.addServerXp(bot, {
                    guildId,
                    guildName: interaction.channel.guild?.name || interaction.guildID,
                    userId,
                    guildData,
                    amount: Number(dropData.value),
                    memberRoles
                });

                resultMessage = translate("OPEN_XP_DROP", lang, {
                    user: userId,
                    amount: dropData.value
                });

            } else if (dropData.type === "promo") {
                const itemName = dropData.itemName || translate("PROMO_CODE_FALLBACK", lang);
                resultMessage = translate("PROMO_DROP_SERVER", lang, {
                    user: userId,
                    item: itemName
                });

                try {
                    const dmChannel = await bot.getDMChannel(userId)
                    await bot.createMessage(dmChannel.id, translate("PROMO_DROP_DM", lang, {
                        item: itemName,
                        code: dropData.value
                    }))
                } catch (err) {
                    resultMessage = translate("PROMO_DROP_DM_OFF", lang, {
                        user: userId,
                        item: itemName
                    });
                }

            } else if (dropData.type === "coin") {
                const user = await User.findOneAndUpdate(
                    { userId },
                    { $setOnInsert: { userId } },
                    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
                );

                user.balance += Number(dropData.value);
                await user.save();
                resultMessage = translate("COIN_DROP", lang, {
                    user: userId,
                    amount: dropData.value
                });
            }

            await bot.editMessage(interaction.channel.id, messageId, {
                embed: {
                    title: translate("DROP_OPEN_TITLE", lang),
                    description: resultMessage,
                    color: 0x2ecc71
                },
                components: []
            });

            activeDrops.delete(messageId);

        } catch (err) {
            console.error("[DropEngine] Ödül dağıtım hatası:", err);
            activeDrops.delete(messageId);
        }
    },

    attemptAutoDrop: async (bot, guildData, channelId, activeMessageCount) => {
        if (guildData.isDropsEnabled === false) return;

        if (activeMessageCount < 10) return;

        const now = Date.now();
        const sycle = 24 * 60 * 60 * 1000;

        let dropTimes = autoDropTracker.get(guildData.guildId) || [];

        dropTimes = dropTimes.filter(t => now - t < sycle);

        if (dropTimes.length >= 2) {
            autoDropTracker.set(guildData.guildId, dropTimes);
            return;
        }

        if (Math.random() > 0.02) return;

        dropTimes.push(now);
        autoDropTracker.set(guildData.guildId, dropTimes);

        const rand = Math.random();
        let payload;
        if (rand < 0.5) {
            payload = { type: "coin", value: Math.floor(Math.random() * 81) + 50 };
        } else {
            payload = { type: "xp", value: Math.floor(Math.random() * 81) + 100 };
        }

        module.exports.spawnDrop(bot, channelId, payload, guildData.language);
    }
}
