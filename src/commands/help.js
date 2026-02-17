const translate = require("../utils/Translate");
const en = require("../locales/en.json");
const tr = require("../locales/tr.json");

const getLocalizations = (keyname) => {
    return {
        "tr": tr[keyname],
    }
}

module.exports = {
    name: "help",
    aliases: ["yardım", "komutlar", "h", "y"],
    description: "CMD_DESC_HELP",
    displayName: "CMD_NAME_HELP",
    permLevel: 0,

    slashCommand: {
        name: "help",
        name_localizations: getLocalizations("CMD_NAME_HELP"),
        description: en.CMD_DESC_HELP,
        description_localizations: getLocalizations("CMD_DESC_HELP"),
        type: 1
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const prefix = guildData ? guildData.prefix : process.env.PREFIX || "-";

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return msgOrInteraction.createMessage(payload);
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        };

        const categories = {
            main: {
                label: translate("CAT_MAIN", lang),
                description: translate("CAT_MAIN_DESC", lang),
                emoji: "🏠",
                text: translate("HELP_MAIN_TEXT", lang)
            },
            economy: {
                label: translate("CAT_ECO", lang),
                description: translate("CAT_ECO_DESC", lang),
                emoji: "💰",
                commands: ["daily", "balance", "duel", "leaderboard"]
            },
            moderation: {
                label: translate("CAT_MOD", lang),
                description: translate("CAT_MOD_DESC", lang),
                emoji: "🛡️",
                commands: ["kick", "ban", "unban", "mute", "unmute", "warn", "clear"]
            },
            user: {
                label: translate("CAT_USER", lang),
                description: translate("CAT_USER_DESC", lang),
                emoji: "👤",
                commands: ["profile", "stats", "serverinfo", "8ball", "invite", "say"]
            },
            system: {
                label: translate("CAT_SYS", lang),
                description: translate("CAT_SYS_DESC", lang),
                emoji: "⚙️",
                commands: ["autorole", "welcome", "language", "prefix", "log", "slang"]
            }
        };

        const embed = {
            title: `📚 ${bot.user.username} - ` + translate("HELP_TITLE", lang),
            description: categories.main.text,
            color: 0x3498db,
            thumbnail: { url: bot.user.dynamicAvatarURL("png", 256) },
        };

        const options = Object.keys(categories).map(key => {
            if (key === "main") return null;
            return {
                label: categories[key].label,
                description: categories[key].description,
                value: key,
                emoji: { name: categories[key].emoji }
            };
        }).filter(o => o !== null);

        options.unshift({
            label: translate("CAT_MAIN", lang),
            description: translate("CAT_MAIN_DESC", lang),
            value: "main",
            emoji: { name: "🏠" }
        });

        const components = [{
            type: 1,
            components: [{
                type: 3,
                custom_id: "help_menu",
                placeholder: translate("HELP_PLACEHOLDER", lang),
                options: options
            }]
        }];

        let message;
        if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
            await msgOrInteraction.createMessage({ embed: embed, components: components });
            message = await msgOrInteraction.getOriginalMessage();
        } else {
            message = await bot.createMessage(msgOrInteraction.channel.id, { embed: embed, components: components });
        }

        const listener = async (interaction) => {
            if (interaction.message.id !== message.id) return;

            const userId = msgOrInteraction.author ? msgOrInteraction.author.id : msgOrInteraction.member.id;
            if (interaction.member.id !== userId) {
                return interaction.createMessage({ content: "⚠️ " + translate("NOT_YOUR_MENU", lang), flags: 64 });
            }

            await interaction.deferUpdate();

            const selectedValue = interaction.data.values[0];
            const category = categories[selectedValue];

            let newEmbed = {
                title: `${category.emoji} ${category.label}`,
                color: 0x3498db,
                thumbnail: { url: bot.user.dynamicAvatarURL("png", 256) },
                footer: { text: `Visually Help | Prefix: ${prefix}` }
            };

            if (selectedValue === "main") {
                newEmbed.description = category.text;
            } else {
                const cmdList = category.commands.map(cmdName => {
                    const cmd = bot.commands.get(cmdName);

                    if (!cmd) return `**${prefix}${cmdName}**`;

                    const visibleName = cmd.displayName ? translate(cmd.displayName, lang) : cmd.name;
                    const descKey = cmd.description || "NO_DESC";
                    const description = translate(descKey, lang);

                    return `**${prefix}${visibleName}:** ${description}`;
                }).join("\n");

                newEmbed.description = `**${category.description}**\n\n${cmdList}`;
            }

            await bot.editMessage(interaction.channel.id, interaction.message.id, {
                embed: newEmbed,
                components: components
            });
        };

        bot.on("interactionCreate", listener);

        setTimeout(() => {
            bot.removeListener("interactionCreate", listener);
            try {
                bot.editMessage(message.channel.id, message.id, { components: [] });
            } catch(e) {}
        }, 120000);
    }
};