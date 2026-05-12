const Guild = require("../database/models/Guild");
const DropEngine = require("../utils/DropEngine");

module.exports = {
    execute: async (bot, interaction) => {
        if (![2, 3].includes(interaction.type)) return;

        let guildData = await Guild.findOne({ guildId: interaction.guildID });
        if (!guildData) {
            guildData = new Guild({ guildId: interaction.guildID });
            await guildData.save();
        }

        if (interaction.type === 2) {
            const cmdName = interaction.data.name;
            let cmd = bot.commands.get(cmdName);

            if (!cmd && bot.aliases?.has(cmdName)) {
                cmd = bot.commands.get(bot.aliases.get(cmdName));
            }

            if (!cmd) {
                cmd = [...bot.commands.values()].find((command) => command.slashCommand?.name === cmdName);
            }

            if (!cmd) return;

            const args = interaction.data.options
                ? interaction.data.options.map(opt => opt.value)
                : [];

            try {
                await cmd.execute(bot, interaction, args, guildData);
            } catch (err) {
                console.error(`Slash Hatası (${cmdName}):`, err);
                return interaction.createMessage({
                    content: "Komut çalıştırılırken bir hata oluştu.",
                    flags: 64
                });
            }
        }

        if (interaction.type === 3) {
            try {
                await DropEngine.handleInteraction(bot, interaction, guildData);
            } catch (err) {
                console.error(`BileÅŸen HatasÄ± (${interaction.data?.custom_id || "unknown"}):`, err);

                if (!interaction.acknowledged) {
                    return interaction.createMessage({
                        content: "EtkileÅŸim iÅŸlenirken bir hata oluÅŸtu.",
                        flags: 64
                    });
                }
            }
        }
    }
};
