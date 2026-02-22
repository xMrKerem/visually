const Warning = require("../database/models/Warning");
const translate = require("../utils/Translate");

function generateID() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

module.exports = {
    name: "warn",
    aliases: ["uyarı", "uyar"],
    displayName: "CMD_NAME_WARN",
    description: "CMD_DESC_WARN",
    permLevel: 3,

    slashCommand: {
        name: "warn",
        name_localizations: { "tr": "uyari" },
        description: "Manage user warnings.",
        description_localizations: { "tr": "Kullanıcı uyarılarını yönetir." },
        type: 1,
        default_member_permissions: "4194304",
        options: [
            {
                name: "add",
                name_localizations: { "tr": "ekle" },
                description: "Warn a user.",
                description_localizations: { "tr": "Bir kullanıcıyı uyarır." },
                type: 1,
                options: [
                    { name: "user", name_localizations: { "tr": "kullanıcı" }, description: "User to warn", type: 6, required: true },
                    { name: "reason", name_localizations: { "tr": "sebep" }, description: "Reason", type: 3, required: false }
                ]
            },
            {
                name: "list",
                name_localizations: { "tr": "liste" },
                description: "List warnings of a user.",
                description_localizations: { "tr": "Kullanıcının uyarılarını listeler." },
                type: 1,
                options: [
                    { name: "user", name_localizations: { "tr": "kullanıcı" }, description: "User to check", type: 6, required: true }
                ]
            },
            {
                name: "delete",
                name_localizations: { "tr": "sil" },
                description: "Delete a warning by ID.",
                description_localizations: { "tr": "ID ile bir uyarıyı siler." },
                type: 1,
                options: [
                    { name: "id", name_localizations: { "tr": "id" }, description: "Warning ID (e.g. A7X2)", type: 3, required: true }
                ]
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const reply = (payload) => msgOrInteraction.createMessage ? msgOrInteraction.createMessage(payload) : bot.createMessage(msgOrInteraction.channel.id, payload);

        let subCommand;
        let options = [];

        if (msgOrInteraction.data && msgOrInteraction.data.options) {
            subCommand = msgOrInteraction.data.options[0].name;
            options = msgOrInteraction.data.options[0].options || [];
        }
        else if (args && args.length > 0) {
            subCommand = args[0].toLowerCase();
        } else {
            return reply({ content: translate("WARN_INVALID_USAGE", lang), flags: 64 });
        }

        const moderator = msgOrInteraction.author || (msgOrInteraction.member ? msgOrInteraction.member.user : null);

        if (subCommand === "add" || subCommand === "ekle") {
            let targetId, reason;

            if (options.length > 0) {
                targetId = options[0].value;
                reason = options[1] ? options[1].value : translate("NO_REASON", lang);
            } else {
                targetId = msgOrInteraction.mentions[0] ? msgOrInteraction.mentions[0].id : args[1];
                reason = args.slice(2).join(" ") || translate("NO_REASON", lang);
            }

            if (!targetId) return reply({ content: translate("WARN_NO_USER", lang), flags: 64 });

            if (targetId === moderator.id || targetId === bot.user.id) return reply({ content: translate("WARN_FAIL_SELF", lang), flags: 64 });

            const warnId = generateID();
            const newWarn = new Warning({
                guildId: msgOrInteraction.guildID,
                userId: targetId,
                moderatorId: moderator.id,
                reason: reason,
                warnId: warnId
            });

            await newWarn.save();
            return reply({ content: translate("WARN_SUCCESS", lang, { user: `<@${targetId}>`, reason: reason, id: warnId }) });
        }

        else if (subCommand === "list" || subCommand === "liste") {
            let targetId;
            if (options.length > 0) targetId = options[0].value;
            else targetId = msgOrInteraction.mentions[0] ? msgOrInteraction.mentions[0].id : args[1];

            if (!targetId) return reply({ content: translate("WARN_NO_USER", lang), flags: 64 });

            const warnings = await Warning.find({ guildId: msgOrInteraction.guildID, userId: targetId }).sort({ date: -1 });

            if (warnings.length === 0) {
                return reply({ content: translate("WARN_NONE", lang, { user: `<@${targetId}>` }) });
            }

            const embed = {
                title: translate("WARN_LIST_TITLE", lang),
                description: `**User:** <@${targetId}>\n**Total:** ${warnings.length}`,
                color: 0xe67e22,
                fields: warnings.map((w, index) => ({
                    name: `🆔 \`${w.warnId}\` | 📅 ${w.date.toLocaleDateString()}`,
                    value: `👮 **Mod:** <@${w.moderatorId}>\n📝 **Reason:** ${w.reason}`
                })).slice(0, 25)
            };

            return reply({ embed: embed });
        }

        else if (subCommand === "delete" || subCommand === "sil") {
            let warnId;
            if (options.length > 0) warnId = options[0].value;
            else warnId = args[1];

            if (!warnId) return reply({ content: translate("WARN_NO_ID", lang), flags: 64 });

            const deleted = await Warning.findOneAndDelete({ guildId: msgOrInteraction.guildID, warnId: warnId });

            if (!deleted) {
                return reply({ content: translate("WARN_NOT_FOUND", lang), flags: 64 });
            }

            return reply({ content: translate("WARN_DELETED", lang, { id: warnId }) });
        }
    }
};