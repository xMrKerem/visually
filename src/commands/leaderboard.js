const User = require("../database/models/User");
const translate = require("../utils/Translate");

module.exports = {
    name: "leaderboard",
    aliases: ["top", "sıralama", "rank"],
    displayName: "CMD_NAME_LEADERBOARD",
    description: "CMD_DESC_LEADERBOARD",
    permLevel: 0,

    slashCommand: {
        name: "leaderboard",
        name_localizations: { "tr": "sıralama" },
        description: "Show the top 10 players.",
        description_localizations: { "tr": "En iyi 10 oyuncuyu göster." },
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const guild = bot.guilds.get(msgOrInteraction.guildID);

        const generateLeaderboard = async (type) => {
            let topUsers = [];
            let title = "";

            if (type === "global") {
                topUsers = await User.find().sort({ level: -1, xp: -1 }).limit(10);
                title = translate("LEADERBOARD_GLOBAL", lang);
            } else {
                if (!guild) return {
                    error: true,
                    text: translate("ONLY_GUILD_ERROR", lang)
                };

                try {
                    await guild.fetchAllMembers(2000);
                } catch(e) {}

                const memberIds = guild.members.map(m => m.id);
                topUsers = await User.find({ userId: { $in: memberIds } }).sort({ level: -1, xp: -1 }).limit(10);
                title = translate("LEADERBOARD_SERVER", lang);
            }

            if (topUsers.length === 0) {
                return {
                    embed: {
                        title: title,
                        description: translate("LEADERBOARD_EMPTY", lang),
                        color: 0xffd700
                    }
                };
            }

            const promises = topUsers.map(async (u, i) => {
                let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
                let displayUsername = u.userId;

                if (u.username && u.username !== "Bilinmeyen" && u.username !== "undefined") {
                    displayUsername = u.username;
                } else {
                    try {
                        let discordUser = bot.users.get(u.userId);

                        if (!discordUser && guild) {
                            const member = guild.members.get(u.userId);
                            if (member) discordUser = member.user || member;
                        }

                        if (!discordUser) {
                            discordUser = await bot.getRESTUser(u.userId);
                        }

                        displayUsername = discordUser ? discordUser.username : `Gizli Kullanıcı (${u.userId})`;
                    } catch (e) {
                        displayUsername = `Bilinmeyen (${u.userId})`;
                    }
                }

                return `${medal} **${displayUsername}** \n└ 🔰 Lvl: **${u.level}** | ⚔️ Win: **${u.wins}**\n\n`;
            });

            const results = await Promise.all(promises);
            const desc = results.join("");

            return {
                embed: {
                    title: title,
                    description: desc,
                    color: 0xffd700,
                }
            };
        };

        const components = [{
            type: 1,
            components: [
                { type: 2, style: 1, label: translate("BTN_SERVER", lang), custom_id: "lb_server", emoji: { name: "🏠" } },
                { type: 2, style: 2, label: translate("BTN_GLOBAL", lang), custom_id: "lb_global", emoji: { name: "🌍" } }
            ]
        }];

        const initialType = guild ? "server" : "global";
        const initialData = await generateLeaderboard(initialType);

        if (initialData.error) {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return msgOrInteraction.createMessage({ content: initialData.text, flags: 64 });
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, { content: initialData.text });
            }
        }

        let message;
        const payload = {
            embed: initialData.embed,
            components: components
        };

        if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
            await msgOrInteraction.createMessage(payload);
            message = await msgOrInteraction.getOriginalMessage();
        } else {
            message = await bot.createMessage(msgOrInteraction.channel.id, payload);
        }

        const listener = async (interaction) => {
            if (!message || !interaction.message || interaction.message.id !== message.id) return;

            const commandUserId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id;
            const clickerId = (interaction.member || interaction.user).id;

            if (clickerId !== commandUserId) {
                return interaction.createMessage({ content: "Bu menüyü sadece komutu kullanan kişi yönetebilir.", flags: 64 });
            }

            await interaction.deferUpdate();

            let newType = "global";
            if (interaction.data.custom_id === "lb_server") newType = "server";
            else if (interaction.data.custom_id === "lb_global") newType = "global";

            const newData = await generateLeaderboard(newType);

            await interaction.editOriginalMessage({
                embed: newData.embed,
                components: components
            });
        };

        bot.on("interactionCreate", listener);

        setTimeout(() => {
            bot.removeListener("interactionCreate", listener);
            try {
                bot.editMessage(message.channel.id, message.id, { components: [] });
            } catch(e) {}
        }, 120000);
    }
};