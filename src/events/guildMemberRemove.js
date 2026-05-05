const Guild = require("../database/models/Guild");
const CanvasUtil = require("../utils/CanvasUtil");
const translate = require("../utils/Translate");

module.exports = {
    name: "guildMemberRemove",
    execute: async (bot, guild, member) => {
        const guildData = await Guild.findOne({ guildId: guild.id });
        if (!guildData) return;

        const lang = guildData.language || "en";

        if (guildData.goodbyeChannel) {
            try {
                const memberCount = guild.memberCount;
                const userObj = member.user || member;

                const buffer = await CanvasUtil.drawWelcome(userObj, "goodbye", memberCount, {
                    welcomeTitle: translate("WELCOME_CARD_TITLE", lang),
                    goodbyeTitle: translate("GOODBYE_CARD_TITLE", lang),
                    welcomeCount: translate("WELCOME_CARD_COUNT", lang),
                    goodbyeCount: translate("GOODBYE_CARD_COUNT", lang)
                });

                await bot.createMessage(guildData.goodbyeChannel, {
                    content: translate("GOODBYE_MSG", lang, { user: userObj.username }),
                }, { file: buffer, name: "goodbye.jpg" });

            } catch (e) {
                console.error(`[Goodbye] Hata: Mesaj gönderilemedi.`, e);
            }
        }
    }
};
