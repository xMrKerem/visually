const ServerLevel = require("../database/models/ServerLevel");
const translate = require("./Translate");
const DropEngine = require("./DropEngine");

const messageCache = new Map();

const calculateActivityMultiplier = (guildId, userId) => {
    const now = Date.now();
    const sycle = 30 * 60 * 1000;
    let messages = messageCache.get(guildId) || [];

    messages = messages.filter((message) => now - message.timestamp < sycle);
    messageCache.set(guildId, messages);

    if (messages.length <= 5) return 1.0;

    const userMessagesCount = messages.filter((message) => message.userId === userId).length;
    const userRatio = userMessagesCount / messages.length;

    if (userRatio >= 0.6) return 0;
    return 1 + userRatio;
};

const applyGuildLevelRewards = async (bot, guildId, userId, guildData, serverLevel, memberRoles = []) => {
    if (!guildData.levelRoles || guildData.levelRoles.size <= 0) return;

    const newRoleId = guildData.levelRoles.get(String(serverLevel.level));
    if (!newRoleId) return;

    try {
        await bot.addGuildMemberRole(guildId, userId, newRoleId);

        if (guildData.roleBehavior === "replace") {
            for (const [, roleId] of guildData.levelRoles.entries()) {
                if (roleId !== newRoleId && memberRoles.includes(roleId)) {
                    await bot.removeGuildMemberRole(guildId, userId, roleId);
                }
            }
        }
    } catch (err) {
        console.error("[Level Engine] Rol HatasÄ±:", err.message);
    }
};

const sendLevelUpMessage = async (bot, guildData, guildName, userId, serverLevel) => {
    const lang = guildData.language || "en";
    const text = translate("LEVEL_UP_MSG", lang, { user: `<@${userId}>`, level: serverLevel.level });

    if (guildData.levelLogChannel) {
        try {
            await bot.createMessage(guildData.levelLogChannel, text);
            return;
        } catch (e) {}
    }

    try {
        const dmChannel = await bot.getDMChannel(userId);
        await bot.createMessage(dmChannel.id, translate("LEVEL_DM_PREFIX", lang, {
            guild: guildName,
            text
        }));
    } catch (e) {}
};

module.exports = {
    calculateNextLevelXP: (level) => {
        return Math.floor(25 * (level * level) + 150 * level + 100);
    },

    addServerXp: async (bot, { guildId, guildName, userId, guildData, amount, memberRoles = [] }) => {
        if (!guildId || !userId || !guildData || !Number.isFinite(amount) || amount <= 0) {
            return { leveledUp: false, serverLevel: null };
        }

        const serverLevel = await ServerLevel.findOneAndUpdate(
            { userId, guildId },
            { $setOnInsert: { level: 1 } },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );

        serverLevel.xp += amount;
        let leveledUp = false;
        let nextLevelXp = module.exports.calculateNextLevelXP(serverLevel.level);

        while (serverLevel.xp >= nextLevelXp) {
            serverLevel.xp -= nextLevelXp;
            serverLevel.level++;
            nextLevelXp = module.exports.calculateNextLevelXP(serverLevel.level);
            leveledUp = true;
        }

        await serverLevel.save();

        if (leveledUp) {
            await applyGuildLevelRewards(bot, guildId, userId, guildData, serverLevel, memberRoles);
            await sendLevelUpMessage(bot, guildData, guildName, userId, serverLevel);
        }

        return { leveledUp, serverLevel };
    },

    handleLevelXP: async (bot, message, guildData) => {
        if (message.author.bot || !message.guild) return;

        const prefixies = [".", "!", "-", "?"];
        if (prefixies.some((prefix) => message.content.startsWith(prefix))) return;

        const guildId = message.guildID;
        const userId = message.author.id;
        const messageLength = message.content.length;
        let messages = messageCache.get(guildId) || [];
        const activityMultiplier = calculateActivityMultiplier(guildId, userId);
        const guildMultiplier = guildData.xpMultiplier || 1.0;
        const baseXP = 10 + Math.min(messageLength / 2, 150);
        const earnedXP = Math.floor(baseXP * activityMultiplier * guildMultiplier);

        messages.push({ userId, timestamp: Date.now(), length: messageLength });

        if (messages.length > 100) messages.shift();

        messageCache.set(guildId, messages);

        DropEngine.attemptAutoDrop(bot, guildData, message.channel.id, messages.length);

        if (activityMultiplier === 0) return;
        if (earnedXP <= 0) return;

        await module.exports.addServerXp(bot, {
            guildId,
            guildName: message.channel.guild.name,
            userId,
            guildData,
            amount: earnedXP,
            memberRoles: message.member?.roles || []
        });
    }
};
