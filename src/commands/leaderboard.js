const User = require("../database/models/User");
const ServerLevel = require("../database/models/ServerLevel");
const RankEngine = require("../utils/RankEngine");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalization = (keyname) => ({ tr: tr[keyname] });

const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `**#${index + 1}**`;
};

module.exports = {
    name: "leaderboard",
    aliases: ["top", "sıralama", "rank", "lb"],
    displayName: "CMD_NAME_LEADERBOARD",
    description: "CMD_DESC_LEADERBOARD",
    permLevel: 0,

    slashCommand: {
        name: "leaderboard",
        name_localizations: getLocalization("CMD_NAME_LEADERBOARD"),
        description: en.CMD_DESC_LEADERBOARD,
        description_localizations: getLocalization("CMD_DESC_LEADERBOARD"),
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const guildId = msgOrInteraction.guildID;
        const isSlash = Boolean(msgOrInteraction.acknowledge);

        if (!guildId) {
            return isSlash
                ? msgOrInteraction.createMessage({ content: translate("ONLY_GUILD_ERROR", lang), flags: 64 })
                : bot.createMessage(msgOrInteraction.channel.id, translate("ONLY_GUILD_ERROR", lang));
        }

        const guild = bot.guilds.get(guildId);

        const resolveUsername = async (userId, fallbackName) => {
            if (
                fallbackName &&
                fallbackName !== "undefined" &&
                fallbackName !== translate("LEADERBOARD_UNKNOWN_USER", lang, { user: userId }) &&
                fallbackName !== translate("LEADERBOARD_HIDDEN_USER", lang, { user: userId })
            ) {
                return fallbackName;
            }

            try {
                let discordUser = bot.users.get(userId);

                if (!discordUser && guild) {
                    const member = guild.members.get(userId);
                    if (member) discordUser = member.user || member;
                }

                if (!discordUser) {
                    discordUser = await bot.getRESTUser(userId).catch(() => null);
                }

                return discordUser
                    ? discordUser.username
                    : translate("LEADERBOARD_HIDDEN_USER", lang, { user: userId });
            } catch (e) {
                return translate("LEADERBOARD_UNKNOWN_USER", lang, { user: userId });
            }
        };

        const formatServerLevelEntry = async (userDoc, index) => {
            const username = await resolveUsername(userDoc.userId, null);
            return `${getMedal(index)} **${username}**\n└ ${translate("LEADERBOARD_LEVEL_LABEL", lang)}: **${userDoc.level}** | ${translate("LEADERBOARD_XP_LABEL", lang)}: **${userDoc.xp}**`;
        };

        const formatRankEntry = async (userDoc, index) => {
            const username = await resolveUsername(userDoc.userId, userDoc.userName);
            const rankName = RankEngine.getRankName(userDoc.rankTier, translate, lang);
            return `${getMedal(index)} **${username}**\n└ ${translate("LEADERBOARD_RANK_LABEL", lang)}: **${rankName}** | ${translate("LEADERBOARD_KP_LABEL", lang)}: **${userDoc.kp}** | ${translate("LEADERBOARD_WL_LABEL", lang)}: **${userDoc.wins}/${userDoc.losses}**`;
        };

        const generateLeaderboard = async (type) => {
            let title = "";
            let entries = [];

            if (type === "server_level") {
                title = translate("LEADERBOARD_SERVER_LEVEL", lang);
                const topUsers = await ServerLevel.find({ guildId })
                    .sort({ level: -1, xp: -1, userId: 1 })
                    .limit(10);

                if (!topUsers.length) {
                    return { title, desc: translate("LEADERBOARD_EMPTY", lang) };
                }

                entries = await Promise.all(topUsers.map((userDoc, index) => formatServerLevelEntry(userDoc, index)));
            } else if (type === "server_rank") {
                title = translate("LEADERBOARD_SERVER_RANK", lang);

                const serverLevelDocs = await ServerLevel.find({ guildId }).select("userId");
                const serverUserIds = serverLevelDocs.map((doc) => doc.userId);
                const topUsers = await User.find({ userId: { $in: serverUserIds } })
                    .sort({ rankTier: -1, kp: -1, wins: -1, losses: 1, userId: 1 })
                    .limit(10);

                if (!topUsers.length) {
                    return { title, desc: translate("LEADERBOARD_EMPTY", lang) };
                }

                entries = await Promise.all(topUsers.map((userDoc, index) => formatRankEntry(userDoc, index)));
            } else {
                title = translate("LEADERBOARD_GLOBAL_RANK", lang);

                const topUsers = await User.find()
                    .sort({ rankTier: -1, kp: -1, wins: -1, losses: 1, userId: 1 })
                    .limit(10);

                if (!topUsers.length) {
                    return { title, desc: translate("LEADERBOARD_EMPTY", lang) };
                }

                entries = await Promise.all(topUsers.map((userDoc, index) => formatRankEntry(userDoc, index)));
            }

            return { title, desc: entries.join("\n\n") };
        };

        const components = [{
            type: 1,
            components: [{
                type: 3,
                custom_id: "leaderboard_select",
                placeholder: translate("LEADERBOARD_PLACEHOLDER", lang),
                options: [
                    { label: translate("LEADERBOARD_SERVER_LEVEL", lang), value: "server_level", emoji: { name: "🏆" } },
                    { label: translate("LEADERBOARD_SERVER_RANK", lang), value: "server_rank", emoji: { name: "⚔️" } },
                    { label: translate("LEADERBOARD_GLOBAL_RANK", lang), value: "global_rank", emoji: { name: "🌍" } }
                ]
            }]
        }];

        const initialData = await generateLeaderboard("server_level");
        const embed = {
            title: initialData.title,
            description: initialData.desc,
            color: 0xffd700
        };

        let message;
        if (isSlash) {
            if (!msgOrInteraction.acknowledged) {
                await msgOrInteraction.acknowledge();
            }

            await msgOrInteraction.createFollowup({ embed, components });
            message = await msgOrInteraction.getOriginalMessage();
        } else {
            message = await bot.createMessage(msgOrInteraction.channel.id, { embed, components });
        }

        const listener = async (interaction) => {
            if (!message || !interaction.message || interaction.message.id !== message.id) return;

            const commandUserId = (msgOrInteraction.member || msgOrInteraction.author || msgOrInteraction.user).id;
            const clickerId = (interaction.member || interaction.user).id;

            if (clickerId !== commandUserId) {
                return interaction.createMessage({ content: translate("NOT_USER", lang), flags: 64 });
            }

            await interaction.deferUpdate();

            const selection = interaction.data.values[0];
            const newData = await generateLeaderboard(selection);

            embed.title = newData.title;
            embed.description = newData.desc;

            await interaction.editOriginalMessage({ embed, components });
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
