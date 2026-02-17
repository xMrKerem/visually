const translate = require("../utils/Translate");

module.exports = {
    name: "serverinfo",
    aliases: ["sunucu", "sunucubilgi", "sb"],
    displayName: "CMD_NAME_SERVERINFO",
    description: "CMD_DESC_SERVERINFO",
    permLevel: 0,

    slashCommand: {
        name: "serverinfo",
        name_localizations: { "tr": "sunucubilgi" },
        description: "Shows detailed information about the server.",
        description_localizations: { "tr": "Sunucu hakkında detaylı bilgi gösterir." },
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);
        const guildId = msgOrInteraction.guildID;
        const guild = bot.guilds.get(guildId);

        if (!guild) return reply("Sunucu bilgisi alınamadı.");

        const owner = guild.members.get(guild.ownerID);
        const ownerTag = owner ? `${owner.username}#${owner.discriminator}` : "Unknown";
        const textChannels = guild.channels.filter(c => c.type === 0).length;
        const voiceChannels = guild.channels.filter(c => c.type === 2).length;
        const categoryChannels = guild.channels.filter(c => c.type === 4).length;
        const totalMembers = guild.memberCount;
        const bots = guild.members.filter(m => m.bot).length;
        const humans = totalMembers - bots;
        const createdTimestamp = Math.floor(guild.createdAt / 1000);

        const embed = {
            title: `${guild.name}`,
            color: 0xe67e22,
            thumbnail: { url: guild.iconURL || null },
            image: { url: guild.bannerURL || null },
            fields: [
                {
                    name: "👑 " + translate("SI_OWNER", lang),
                    value: `<@${guild.ownerID}>`,
                    inline: true
                },
                {
                    name: "🆔 ID",
                    value: `\`${guild.id}\``,
                    inline: true
                },
                {
                    name: "📅 " + translate("SI_CREATED", lang),
                    value: `<t:${createdTimestamp}:D> (<t:${createdTimestamp}:R>)`,
                    inline: false
                },
                {
                    name: "👥 " + translate("SI_MEMBERS", lang),
                    value: `Total: **${totalMembers}**\n👤 İnsan: **${humans}**\n🤖 Bot: **${bots}**`,
                    inline: true
                },
                {
                    name: "💬 " + translate("SI_CHANNELS", lang),
                    value: `Total: **${guild.channels.size}**\n📝 Yazı: **${textChannels}**\n🔊 Ses: **${voiceChannels}**`,
                    inline: true
                },
                {
                    name: "🔒 " + translate("SI_ROLES", lang),
                    value: `**${guild.roles.size}**`,
                    inline: true
                },
                {
                    name: "🚀 Boost",
                    value: `Seviye: **${guild.premiumTier}**\nBoost Sayısı: **${guild.premiumSubscriptionCount || 0}**`,
                    inline: true
                }
            ],
        };

        return reply({ embed: embed });
    }
};