const translate = require("../utils/Translate");
const os = require("os");

module.exports = {
    name: "stats",
    aliases: ["istatistik", "i", "botbilgi", "ping", "status"],
    displayName: "CMD_NAME_STATS",
    description: "CMD_DESC_STATS",
    permLevel: 0,

    slashCommand: {
        name: "stats",
        name_localizations: { "tr": "istatistik" },
        description: "Shows bot statistics (Ping, Uptime, RAM).",
        description_localizations: { "tr": "Bot istatistiklerini gösterir (Ping, Süre, RAM)." },
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ping = bot.shards.get(0).latency;
        const uptimeMs = bot.uptime;
        const days = Math.floor(uptimeMs / 86400000);
        const hours = Math.floor(uptimeMs / 3600000) % 24;
        const minutes = Math.floor(uptimeMs / 60000) % 60;
        const seconds = Math.floor(uptimeMs / 1000) % 60;
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = {
            title: `📊 ${bot.user.username} - ` + translate("STATS_TITLE", lang),
            thumbnail: { url: bot.user.dynamicAvatarURL("png", 256) },
            fields: [
                {
                    name: "🔌 " + translate("STATS_PING", lang),
                    value: `**${ping}** ms`,
                    inline: true
                },
                {
                    name: "💾 " + translate("STATS_RAM", lang),
                    value: `**${memoryUsage}** MB`,
                    inline: true
                },
                {
                    name: "⏱️ " + translate("STATS_UPTIME", lang),
                    value: `\`${uptimeStr}\``,
                    inline: true
                },
                {
                    name: "🏠 " + translate("STATS_SERVERS", lang),
                    value: `**${bot.guilds.size}**`,
                    inline: true
                },
                {
                    name: "👥 " + translate("STATS_USERS", lang),
                    value: `**${bot.users.size}**`,
                    inline: true
                },
                {
                    name: "📚 Library",
                    value: `Eris v${require("eris").VERSION}`,
                    inline: true
                }
            ],
        };

        return reply({ embed: embed });
    }
};