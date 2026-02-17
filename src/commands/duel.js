const FightSystem = require("../utils/FightSystem");
const CanvasUtil = require("../utils/CanvasUtil");
const translate = require("../utils/Translate");
const LevelSystem = require("../utils/LevelSystem");
const User = require("../database/models/User");

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
            const p1Data = {
                id: author.id,
                username: author.username || translate("PLAYER", lang, { num: 1 }),
                avatarURL: author.dynamicAvatarURL("png", 256)
            };
            const p2Data = {
                id: targetUser.id,
                username: targetUser.username || translate("PLAYER", lang, { num: 2 }),
                avatarURL: targetUser.dynamicAvatarURL("png", 256)
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
                    ? translate("DUEL_GAME_OVER", lang, { winner: gameInstance.getPlayer(gameInstance.turn).name })
                    : translate("DUEL_TURN_MSG", lang, { player: currentPlayer.name, log: logText });

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

                    const prizeCoin = Math.floor(Math.random() * 51) + 50;
                    const prizeXp = Math.floor(Math.random() * 101) + 100;

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
                            winner: result.winner.name,
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

                    } catch (err) {
                        console.error("XP/Level hatası:", err);
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