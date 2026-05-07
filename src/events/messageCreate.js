const Guild = require("../database/models/Guild");
const LevelSystem = require("../utils/LevelSystem");
const translate = require("../utils/Translate");
const AIHandler = require("../utils/AIHandler");

function calculatePermLevel(member) {
    let permLevel = 0;
    if (!member || !member.permissions) return 0;
    if (member.permissions.has("manageMessages")) permLevel = 1;
    if (member.permissions.has("manageRoles")) permLevel = 2;
    if (member.permissions.has("banMembers")) permLevel = 3;
    if (member.permissions.has("administrator")) permLevel = 4;
    if (member.id === process.env.OWNER_ID) permLevel = 5;
    return permLevel;
}

module.exports = {
    execute: async (bot, message) => {
        if (message.author.bot) return;
        if (!message.guildID) return;

        let guildData = await Guild.findOne({ guildId: message.guildID });
        if (!guildData) {
            guildData = new Guild({ guildId: message.guildID });
            await guildData.save();
        }

        const lang = guildData.language || "en";
        const prefix = guildData.prefix || process.env.PREFIX;
        const slangMode = guildData.slangMode || false;

        LevelSystem.handleLevelXP(bot, message, guildData).catch(console.error);

        if (message.mentions.find(u => u.id === bot.user.id)) {
            const cleanMessage = message.content.replace(/<@!?[0-9]+>/g, "").trim();
            if (!cleanMessage) return

            await message.channel.sendTyping();
            const res = await AIHandler.getResponse(message.author.id, cleanMessage, lang, slangMode);

            if (res.length > 2000) {
                const chunks = res.match(/[\s\S]{1,2000}/g) || []

                for (let i = 0; i < chunks.length; i++) {
                    await bot.createMessage(message.channel.id, {
                        content: chunks[i],
                        messageReference: i === 0 ? { messageID: message.id } : undefined
                    })
                }
            } else {
                return bot.createMessage(message.channel.id, {
                    content: res,
                    messageReference: { messageID: message.id }
                });
            }
            return
        }

        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        let cmd;
        if (bot.commands.has(commandName)) {
            cmd = bot.commands.get(commandName);
        } else if (bot.aliases.has(commandName)) {
            cmd = bot.commands.get(bot.aliases.get(commandName));
        }

        if (!cmd) return;

        const member = message.member || await bot.getRESTGuildMember(message.guildID, message.author.id);
        const userPermlvl = calculatePermLevel(member);

        if (cmd.permLevel && userPermlvl < cmd.permLevel) {
            return bot.createMessage(message.channel.id, {
                content: translate("NO_PERMISSION", lang, { level: cmd.permLevel })
            });
        }

        try {
            await cmd.execute(bot, message, args, guildData);
        } catch (err) {
            console.error(`[KOMUT HATASI] ${commandName}:`, err);
            bot.createMessage(message.channel.id, translate("COMMAND_ERROR", lang));
        }
    }
};