const Guild = require("../database/models/Guild");

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
            const cmd = bot.commands.get(cmdName);

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
        }
    }
};