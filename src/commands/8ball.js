const translate = require("../utils/Translate");

module.exports = {
    name: "8ball",
    aliases: ["küre", "sihirliküre", "sor"],
    displayName: "CMD_NAME_8BALL",
    description: "CMD_DESC_8BALL",
    permLevel: 0,

    slashCommand: {
        name: "8ball",
        name_localizations: { "tr": "küre" },
        description: "Ask the magic 8ball a question.",
        description_localizations: { "tr": "Sihirli küreye bir soru sor." },
        type: 1,
        options: [
            {
                name: "question",
                name_localizations: { "tr": "soru" },
                description: "Your question.",
                description_localizations: { "tr": "Soracağın soru." },
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);

        let question;
        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            question = msgOrInteraction.data.options[0].value;
        } else if (args && args.length > 0) {
            question = args.join(" ");
        } else {
            return reply({ content: translate("8BALL_NO_QUESTION", lang), flags: 64 });
        }

        const answers = translate("8BALL_ANSWERS", lang);
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

        const embed = {
            title: "🎱 " + translate("8BALL_TITLE", lang),
            color: 0x9b59b6,
            fields: [
                { name: "❓ " + translate("8BALL_Q", lang), value: question },
                { name: "💬 " + translate("8BALL_A", lang), value: `**${randomAnswer}**` }
            ],
        };

        return reply({ embed: embed });
    }
};