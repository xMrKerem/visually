const ServerLevel = require("../database/models/ServerLevel");
const translate = require("./Translate");

const messageCache = new Map();

const calculateActivityMultiplier = (guildId, userId) => {
    const now = Date.now();
    const sycle = 30 * 60 * 1000;
    let messages = messageCache.get(guildId) || [];

    messages = messages.filter(m => now - m.timestamp < sycle);
    messageCache.set(guildId, messages);

    if (messages.length <= 5) return 1.0;

    const userMessagesCount = messages.filter(m => m.userId === userId).length;
    const userRatio = userMessagesCount / messages.length;

    if (userRatio >= 0.6) return 0;
    return 1 + userRatio;
}

module.exports = {
    calculateNextLevelXP: (level) => {
        return Math.floor(25 * (level * level) + 150 * level + 100);
    },

    handleLevelXP: async (bot, message, guildData) => {
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

        if (activityMultiplier === 0) return;
        if (earnedXP <= 0) return;

        const serverLevel = await ServerLevel.findOneAndUpdate(
            { userId, guildId },
            { $setOnInsert: { level: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        serverLevel.xp += earnedXP;
        let leveledUp = false;
        let nextLevelXp = module.exports.calculateNextLevelXP(serverLevel.level);

        while (serverLevel.xp >= nextLevelXp) {
            serverLevel.xp -= nextLevelXp;
            serverLevel.level++;
            nextLevelXp = module.exports.calculateNextLevelXP(serverLevel.level)
            leveledUp = true;
        }
        await serverLevel.save()

        if (leveledUp) {
            const lang = guildData.language || "en";

            if (guildData.levelRoles && guildData.levelRoles.size > 0) {
                const newRoleId = guildData.levelRoles.get(String(serverLevel.level));

                if (newRoleId) {
                    try {
                        await bot.addGuildMemberRole(guildId, userId, newRoleId);

                        if (guildData.roleBehavior === "replace") {

                            for (const [level, roleId] of guildData.levelRoles.entries()) {

                                if (roleId !== newRoleId && message.member.roles.includes(roleId)) {
                                    await bot.removeGuildMemberRole(guildId, userId, roleId);
                                }
                            }
                        }

                    } catch (err) {
                        console.error("[Level Engine] Rol Hatası:", err.message);
                    }
                }
            }

            const text = translate("LEVEL_UP_MSG", lang, { user: `<@${userId}>`, level: serverLevel.level });

            if (guildData.levelLogChannel) {
                try {
                    await bot.createMessage(guildData.levelLogChannel, text);
                } catch (e) {}
            } else {
                try {
                    const dmChannel = await bot.getDMChannel(userId);
                    await bot.createMessage(dmChannel.id, translate("LEVEL_DM_PREFIX", lang, {
                        guild: message.channel.guild.name,
                        text
                    }));
                } catch (e) {}
            }
        }
    }
};
