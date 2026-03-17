const FightSystem = require("../utils/FightSystem");
const CanvasUtil = require("../utils/CanvasUtil");
const translate = require("../utils/Translate");
const LevelSystem = require("../utils/LevelSystem");
const User = require("../database/models/User");
const StoreItem = require("../database/models/StoreItem");

async function getEquippedStats(userId) {
    let totalStats = {
        atcMinDmg: 0, atcMaxDmg: 0,
        spcMinDmg: 0, spcMaxDmg: 0,
        minHp: 0, maxHp: 0, bonusHp: 0,
        dmgCritChance: 0.2, spcCritChance: 0.1,
        dmgMissChance: 0.2, spcMissChance: 0.1,
        dmgCriticMultiplier: 1.5,
        defense: 1.3, respawn: false
    };

    const userDB = await User.findOne({ userId: userId });
    if (!userDB || !userDB.equipment) return totalStats;

    const equippedIds = Object.values(userDB.equipment).filter(id => id !== null);
    if (equippedIds.length === 0) return totalStats;

    const items = await StoreItem.find({ itemId: { $in: equippedIds } });

    items.forEach(item => {
        if (!item.stats) return;
        for (const [key, value] of Object.entries(item.stats)) {
            if (typeof value === "number") {
                totalStats[key] = (totalStats[key] || 0) + value;
            } else if (typeof value === "boolean" && key === "respawn") {
                if (value === true) totalStats.respawn = true;
            }
        }
    });

    return totalStats;
}

// 👇 YENİ SİSTEM: Maç sonu eşyaların limitini (Durability) azaltır ve kırılanları siler
async function handleDurability(userId, bot, channelId, lang) {
    const userDB = await User.findOne({ userId });
    if (!userDB || !userDB.equipment) return;

    let brokenItems = [];
    const slots = ["weapon", "shield", "tech", "heal"];
    let inventoryModified = false;

    for (const slot of slots) {
        const itemId = userDB.equipment[slot];
        if (!itemId) continue;

        const invItemIndex = userDB.inventory.findIndex(i => i.itemId === itemId);
        if (invItemIndex > -1) {
            let invItem = userDB.inventory[invItemIndex];

            // Sadece kullanım limiti olan (limit > 0) eşyaların canı azalır
            if (invItem.usageLimit > 0) {
                invItem.usageLimit -= 1;
                inventoryModified = true;

                // Eşya kırıldıysa/tükendiyse
                if (invItem.usageLimit <= 0) {
                    brokenItems.push(invItem.name[lang] || invItem.name["en"] || invItem.name || "Eşya");
                    userDB.equipment[slot] = null; // Üstünden çıkar

                    // Eğer eşyadan çantada birden fazla (amount > 1) varsa
                    if (invItem.amount > 1) {
                        invItem.amount -= 1;
                        // Orijinal limitini sıfırla ki bir sonraki sağlam eşyayı kullansın
                        const storeData = await StoreItem.findOne({ itemId: invItem.itemId });
                        invItem.usageLimit = storeData ? storeData.usageLimit : 1;
                    } else {
                        // Tamamen bittiyse çantadan tamamen sil
                        userDB.inventory.splice(invItemIndex, 1);
                    }
                }
            }
        }
    }

    if (inventoryModified) {
        userDB.markModified("equipment");
        userDB.markModified("inventory");
        await userDB.save();
    }

    // Kırılan eşya varsa kanala bildirim at!
    if (brokenItems.length > 0) {
        let msgText = lang === "tr"
            ? `⚠️ <@${userId}>, savaşın şiddetinden dolayı şu eşyaların kırıldı/tükendi: **${brokenItems.join(", ")}**`
            : `⚠️ <@${userId}>, due to the intensity of the battle, these items broke/depleted: **${brokenItems.join(", ")}**`;
        bot.createMessage(channelId, msgText).catch(() => {});
    }
}

module.exports = {
    name: "duel",
    aliases: ["düello", "savaş", "vs", "fight"],
    displayName: "CMD_NAME_DUEL",
    description: "CMD_DESC_DUEL",
    permLevel: 0,

    slashCommand: {
        name: "duel",
        name_localizations: { "tr": "düello" },
        description: "Challenge a user to a turn-based fight!",
        description_localizations: { "tr": "Bir kullanıcıya sıra tabanlı dövüş için meydan oku!" },
        options: [
            {
                name: "target",
                name_localizations: { "tr": "rakip" },
                description: "The user you want to duel with.",
                description_localizations: { "tr": "Düello yapmak istediğin kullanıcı." },
                type: 6,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        let isSlash = false;
        if (msgOrInteraction.acknowledge) {
            isSlash = true;
            try {
                if (!msgOrInteraction.acknowledged) {
                    await msgOrInteraction.defer();
                }
            } catch (e) {}
        }

        const author = msgOrInteraction.author || (msgOrInteraction.member ? msgOrInteraction.member.user : null);
        if (!author) return;

        let targetUser;
        try {
            if (isSlash) {
                if (msgOrInteraction.data.options && msgOrInteraction.data.options[0]) {
                    const targetId = msgOrInteraction.data.options[0].value;
                    targetUser = bot.users.get(targetId) || await bot.getRESTUser(targetId);
                }
            } else {
                if (msgOrInteraction.mentions && msgOrInteraction.mentions.length > 0) {
                    targetUser = msgOrInteraction.mentions[0];
                } else if (args && args[0]) {
                    targetUser = await bot.getRESTUser(args[0]).catch(() => null);
                }
            }
        } catch (e) {}

        const reply = async (payload) => {
            try {
                if (isSlash) {
                    return await msgOrInteraction.createFollowup(payload);
                } else {
                    return await bot.createMessage(msgOrInteraction.channel.id, payload);
                }
            } catch (e) {
                return null;
            }
        };

        if (!targetUser) return reply({ content: translate("DUEL_MENTION_FAIL", lang), flags: 64 });
        if (targetUser.id === author.id) return reply({ content: translate("DUEL_SELF", lang), flags: 64 });
        if (targetUser.bot) return reply({ content: translate("DUEL_BOT", lang), flags: 64 });

        const requestComponents = [{
            type: 1,
            components: [
                { type: 2, style: 3, label: translate("DUEL_ACCEPT", lang), custom_id: `duel_accept` },
                { type: 2, style: 4, label: translate("DUEL_DECLINE", lang), custom_id: `duel_decline` }
            ]
        }];

        const reqMsg = await reply({
            content: translate("DUEL_REQUEST", lang, {
                target: targetUser.id,
                author: author.id
            }),
            components: requestComponents
        });

        if (!reqMsg) return;

        let requestTimeoutTimer;

        const startGame = async (interaction) => {
            const p1Stats = await getEquippedStats(author.id);
            const p2Stats = await getEquippedStats(targetUser.id);

            const p1Data = {
                id: author.id,
                username: author.username || translate("PLAYER", lang, { num: 1 }),
                avatarURL: author.dynamicAvatarURL("png", 256),
                stats: p1Stats
            };
            const p2Data = {
                id: targetUser.id,
                username: targetUser.username || translate("PLAYER", lang, { num: 2 }),
                avatarURL: targetUser.dynamicAvatarURL("png", 256),
                stats: p2Stats
            };

            const game = new FightSystem(p1Data, p2Data, translate, lang);

            let gameTimeoutTimer;
            const resetGameTimer = () => {
                if (gameTimeoutTimer) clearTimeout(gameTimeoutTimer);
                gameTimeoutTimer = setTimeout(() => {
                    if (!game.isFinished) {
                        bot.removeListener("interactionCreate", gameListener);
                        bot.editMessage(reqMsg.channel.id, reqMsg.id, {
                            content: translate("DUEL_GAME_TIMEOUT", lang),
                            components: []
                        }).catch(() => {});
                    }
                }, 120000);
            };

            const renderGame = async (gameInstance) => {
                const buffer = await CanvasUtil.drawDuel(gameInstance.p1, gameInstance.p2);
                const currentPlayer = gameInstance.getPlayer(gameInstance.turn);

                let logText = "";
                if (gameInstance.log.length > 0) {
                    logText = `\n> ${gameInstance.log[gameInstance.log.length - 1]}`;
                }

                const buttons = [];
                if (!gameInstance.isFinished) {
                    buttons.push({
                        type: 1,
                        components: [
                            { type: 2, style: 1, label: translate("DUEL_BTN_ATTACK", lang), custom_id: "attack", disabled: false },
                            { type: 2, style: 2, label: translate("DUEL_BTN_GUARD", lang), custom_id: "guard", disabled: false },
                            { type: 2, style: 3, label: translate("DUEL_BTN_HEAL", lang), custom_id: "heal", disabled: currentPlayer.mana < 40 },
                            { type: 2, style: 4, label: translate("DUEL_BTN_SPECIAL", lang), custom_id: "special", disabled: currentPlayer.mana < 100 },
                            { type: 2, style: 2, label: translate("DUEL_BTN_FLEE", lang), custom_id: "flee", disabled: false }
                        ]
                    });
                }

                const contentText = gameInstance.isFinished
                    ? translate("DUEL_GAME_OVER", lang, { winner: gameInstance.getPlayer(gameInstance.turn).id })
                    : translate("DUEL_TURN_MSG", lang, { player: currentPlayer.id, log: logText });

                return {
                    content: contentText,
                    file: { file: buffer, name: "duel.jpg" },
                    embed: {
                        image: { url: "attachment://duel.jpg" },
                        color: 0x2f3136,
                    },
                    components: buttons
                };
            };

            try {
                const initialPayload = await renderGame(game);
                await interaction.editParent(initialPayload);
                resetGameTimer();
            } catch (e) {}

            const gameListener = async (gameInt) => {
                if (gameInt.message.id !== reqMsg.id) return;

                if (gameInt.member.id !== game.turn) {
                    return gameInt.createMessage({ content: translate("DUEL_QUE_FAIL", lang), flags: 64 });
                }

                resetGameTimer();

                const action = gameInt.data.custom_id;
                await gameInt.acknowledge();

                const result = await game.move(gameInt.member.id, action);
                const newPayload = await renderGame(game);
                await gameInt.editParent(newPayload);

                if (result.finished) {
                    clearTimeout(gameTimeoutTimer);
                    bot.removeListener("interactionCreate", gameListener);

                    const winnerId = result.winner.id;
                    const loserId = (winnerId === p1Data.id) ? p2Data.id : p1Data.id;

                    const prizeCoin = Math.floor(Math.random() * 201) + 150;
                    const prizeXp = Math.floor(Math.random() * 201) + 150;

                    try {
                        let winnerUser = await User.findOne({ userId: winnerId });
                        if (!winnerUser) winnerUser = new User({ userId: winnerId });

                        winnerUser.balance += prizeCoin;
                        winnerUser.wins += 1;

                        const leveledUp = await LevelSystem.addXp(winnerUser, prizeXp);

                        let loserUser = await User.findOne({ userId: loserId });
                        if (!loserUser) loserUser = new User({ userId: loserId });

                        loserUser.losses += 1;
                        await LevelSystem.addXp(loserUser, Math.floor(Math.random() * 11) + 10);

                        let msgText = translate("DUEL_WIN_PRIZE", lang, {
                            winner: result.winner.id,
                            prize: prizeCoin,
                            xp: prizeXp
                        });

                        if (leveledUp) {
                            msgText += translate("LEVEL_UP_MSG", lang, {
                                user: result.winner.name,
                                level: winnerUser.level
                            });
                        }

                        bot.createMessage(msgOrInteraction.channel.id, msgText);

                        // 👇 İŞTE BÜYÜ BURADA: Maç biter bitmez iki oyuncunun da eşyalarının limitini kontrol et!
                        await handleDurability(p1Data.id, bot, msgOrInteraction.channel.id, lang);
                        await handleDurability(p2Data.id, bot, msgOrInteraction.channel.id, lang);

                    } catch (err) {
                        console.error("XP/Level veya Durability hatası:", err);
                    }
                }
            };
            bot.on("interactionCreate", gameListener);
        };

        const requestListener = async (interaction) => {
            if (interaction.message.id !== reqMsg.id) return;
            if (interaction.member.id !== targetUser.id) {
                return interaction.createMessage({ content: translate("DUEL_NOT_FOR_YOU", lang), flags: 64 });
            }

            if (interaction.data.custom_id === "duel_decline") {
                clearTimeout(requestTimeoutTimer);
                bot.removeListener("interactionCreate", requestListener);
                return interaction.editParent({
                    content: translate("DUEL_REJECTED", lang, { target: targetUser.id }),
                    components: []
                });
            }

            if (interaction.data.custom_id === "duel_accept") {
                clearTimeout(requestTimeoutTimer);
                bot.removeListener("interactionCreate", requestListener);

                await interaction.acknowledge();
                startGame(interaction);
            }
        };

        bot.on("interactionCreate", requestListener);

        requestTimeoutTimer = setTimeout(() => {
            bot.removeListener("interactionCreate", requestListener);
            try {
                if (reqMsg.content.includes(author.id)) {
                    bot.editMessage(reqMsg.channel.id, reqMsg.id, {
                        content: translate("DUEL_TIMEOUT", lang),
                        components: []
                    }).catch(() => {});
                }
            } catch (e) {}
        }, 30000);
    }
};