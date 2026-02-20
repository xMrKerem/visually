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

                await guild.fetchAllMembers()
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

            let desc = "";
            for (let i = 0; i < topUsers.length; i++) {
                const u = topUsers[i];
                let medal = "";

                if (i === 0) medal = "🥇";
                else if (i === 1) medal = "🥈";
                else if (i === 2) medal = "🥉";
                else medal = `**#${i + 1}**`;

                let username = u.userId;
                try {
                    const discordUser = bot.users.get(u.userId) || await bot.getRESTUser(u.userId);
                    if (discordUser) username = discordUser.username;
                } catch (e) {}

                desc += `${medal} **${username}** \n└ 🔰 Lvl: **${u.level}**       |       ⚔️ Win: **${u.wins}**\n\n`;
            }

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
            if (!message || interaction.message.id !== message.id) return;

            const userId = msgOrInteraction.author ? msgOrInteraction.author.id : msgOrInteraction.member.id;
            if (interaction.member.id !== userId) {
                return interaction.createMessage({ content: "Bu menüyü sadece komutu kullanan kişi yönetebilir.", flags: 64 });
            }

            await interaction.deferUpdate();

            let newType = "global";
            if (interaction.data.custom_id === "lb_server") newType = "server";
            else if (interaction.data.custom_id === "lb_global") newType = "global";

            const newData = await generateLeaderboard(newType);

            await bot.editMessage(interaction.channel.id, interaction.message.id, {
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