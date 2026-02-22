const User = require("../database/models/User");
const translate = require("../utils/Translate");

module.exports = {
    name: "balance",
    aliases: ["cüzdan", "bakiye", "money", "cash", "bal"],
    displayName: "CMD_NAME_BALANCE",
    description: "CMD_DESC_BALANCE",
    permLevel: 0,

    slashCommand: {
        name: "balance",
        name_localizations: { "tr": "bakiye" },
        description: "Check your wallet balance.",
        description_localizations: { "tr": "Cüzdanındaki parayı gösterir." },
        type: 1,
        options: [
            {
                name: "user",
                name_localizations: { "tr": "kullanıcı" },
                description: "Check another user's balance.",
                description_localizations: { "tr": "Başka bir kullanıcının bakiyesine bak." },
                type: 6,
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        let targetUser;

        if (msgOrInteraction.data && msgOrInteraction.data.options && msgOrInteraction.data.options[0]) {
            const targetId = msgOrInteraction.data.options[0].value;
            targetUser = bot.users.get(targetId) || await bot.getRESTUser(targetId);
        }
        else if (msgOrInteraction.mentions && msgOrInteraction.mentions.length > 0) {
            targetUser = msgOrInteraction.mentions[0];
        }
        else {
            targetUser = msgOrInteraction.author || (msgOrInteraction.member ? msgOrInteraction.member.user : null);
        }

        if (!targetUser) return;

        let user = await User.findOne({ userId: targetUser.id });
        if (!user) {
            user = new User({ userId: targetUser.id });
            await user.save();
        }

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return msgOrInteraction.createMessage(payload);
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        const embed = {
            title: translate("BALANCE_TITLE", lang, { user: targetUser.username }),
            color: 0xf1c40f,
            fields: [
                { name: "💰 " + translate("WALLET", lang), value: `**${user.balance}**`, inline: true },
                { name: "🏆 " + translate("WINS", lang), value: `**${user.wins}**`, inline: true },
                { name: "🔰 " + translate("LEVEL", lang), value: `**${user.level}**`, inline: true }
            ],
            thumbnail: { url: targetUser.dynamicAvatarURL("png", 256) },
        };

        return reply({ embed: embed });
    }
};