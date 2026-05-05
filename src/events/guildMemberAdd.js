const Guild = require("../database/models/Guild");
const CanvasUtil = require("../utils/CanvasUtil");
const translate = require("../utils/Translate");

module.exports = {
    name: "guildMemberAdd",
    execute: async (bot, guild, member) => {
        const guildData = await Guild.findOne({ guildId: guild.id });
        if (!guildData) return;

        const lang = guildData.language || "en";

        if (guildData.autorole) {
            try {
                await member.addRole(guildData.autorole, "Visually Autorole System");
            } catch (e) {
                console.error(`[Autorole] Hata: ${guild.name} sunucusunda rol verilemedi.`);
            }
        }

        if (guildData.welcomeChannel) {
            try {
                const memberCount = guild.memberCount;
                const buffer = await CanvasUtil.drawWelcome(member, "welcome", memberCount, {
                    welcomeTitle: translate("WELCOME_CARD_TITLE", lang),
                    goodbyeTitle: translate("GOODBYE_CARD_TITLE", lang),
                    welcomeCount: translate("WELCOME_CARD_COUNT", lang),
                    goodbyeCount: translate("GOODBYE_CARD_COUNT", lang)
                });

                await bot.createMessage(guildData.welcomeChannel, {
                    content: translate("WELCOME_MSG", lang, { user: `<@${member.id}>` }),
                }, { file: buffer, name: "welcome.jpg" });

            } catch (e) {
                console.error(`[Welcome] Hata: Mesaj gönderilemedi.`, e);
            }
        }
    }
};
