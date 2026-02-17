const translate = require("../utils/Translate");

module.exports = {
    name: "invite",
    aliases: ["davet", "link", "destek"],
    displayName: "CMD_NAME_INVITE",
    description: "CMD_DESC_INVITE",
    permLevel: 0,

    slashCommand: {
        name: "invite",
        name_localizations: { "tr": "davet" },
        description: "Get bot invite link and support server.",
        description_localizations: { "tr": "Botun davet linkini ve destek sunucusunu alır." },
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot%20applications.commands&permissions=8`;
        const supportLink = "https://discord.gg/dAVcz9zK7g";

        const embed = {
            title: "📬 " + translate("INVITE_TITLE", lang),
            description: translate("INVITE_DESC", lang),
            color: 0x2ecc71,
            thumbnail: { url: bot.user.dynamicAvatarURL("png", 256) }
        };

        const components = [{
            type: 1,
            components: [
                { type: 2, style: 5, label: translate("BTN_INVITE", lang), url: inviteLink },
                { type: 2, style: 5, label: translate("BTN_SUPPORT", lang), url: supportLink }
            ]
        }];

        return reply({ embed: embed, components: components });
    }
};