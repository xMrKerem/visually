const User = require("../database/models/User");
const translate = require("../utils/Translate");

module.exports = {
    name: "daily",
    aliases: ["günlük", "maaş"],
    displayName: "CMD_NAME_DAILY",
    description: "CMD_DESC_DAILY",
    permLevel: 0,

    slashCommand: {
        name: "daily",
        name_localizations: { "tr": "günlük" },
        description: "Claim your daily reward.",
        description_localizations: { "tr": "Günlük hediye paranı al." },
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        const author = msgOrInteraction.author || (msgOrInteraction.member ? msgOrInteraction.member.user : null);

        let user = await User.findOne({ userId: author.id });
        if (!user) {
            user = new User({ userId: author.id });
        }

        const cooldown = 86400000;
        const now = Date.now();

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return msgOrInteraction.createMessage(payload);
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        if (user.lastDaily && (now - user.lastDaily) < cooldown) {
            const remaining = cooldown - (now - user.lastDaily);
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);

            return reply({
                content: translate("DAILY_COOLDOWN", lang, { hours, minutes }),
                flags: 64
            });
        }

        const reward = Math.floor(Math.random() * 81) + 70;

        user.balance += reward;
        user.lastDaily = now;
        await user.save();

        return reply(translate("DAILY_SUCCESS", lang, { amount: reward }));
    }
};