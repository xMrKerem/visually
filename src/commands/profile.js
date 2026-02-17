const User = require("../database/models/User");
const CanvasUtil = require("../utils/CanvasUtil");
const LevelSystem = require("../utils/LevelSystem");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");

const getLocalizations = (key, isName = false) => {
    const locals = {
        "tr": tr[key],
        "en-US": en[key],
        "en-GB": en[key]
    };
    Object.keys(locals).forEach(lang => {
        if (!locals[lang]) delete locals[lang];
        else if (isName) locals[lang] = locals[lang].toLowerCase();
    });
    return locals;
};

module.exports = {
    name: "profile",
    aliases: ["profil", "me", "kanya", "kimlik"],
    displayName: "CMD_NAME_PROFILE",
    description: "CMD_DESC_PROFILE",
    permLevel: 0,

    slashCommand: {
        name: "profile",
        name_localizations: getLocalizations("CMD_NAME_PROFILE", true),
        description: en.CMD_DESC_PROFILE || "Shows your profile card.",
        description_localizations: getLocalizations("CMD_DESC_PROFILE"),
        type: 1,
        options: [
            {
                name: "user",
                name_localizations: { "tr": "kullanıcı", "en-US": "user" },
                description: "User to show profile.",
                description_localizations: { "tr": "Profiline bakılacak kullanıcı.", "en-US": "User to show profile." },
                type: 6,
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";

        let targetUser;

        if (msgOrInteraction.data && msgOrInteraction.data.options && msgOrInteraction.data.options[0]) {
            const targetId = msgOrInteraction.data.options[0].value;
            targetUser = bot.users.get(targetId) || await bot.getRESTUser(targetId);
        }
        else if (msgOrInteraction.mentions && msgOrInteraction.mentions.length > 0) {
            targetUser = msgOrInteraction.mentions[0];
        }
        else {
            targetUser = msgOrInteraction.author || (msgOrInteraction.member ? msgOrInteraction.member.user : null);
        }

        if (!targetUser) return;

        let userData = await User.findOne({ userId: targetUser.id });
        if (!userData) {
            userData = new User({ userId: targetUser.id });
            await userData.save();
        }

        const reply = async (payload, file) => {
            try {
                if (msgOrInteraction.createFollowup) {
                    return await msgOrInteraction.createFollowup(payload, file);
                } else {
                    return await bot.createMessage(msgOrInteraction.channel.id, payload, file);
                }
            } catch (e) {
                console.error("Mesaj gönderme hatası:", e);
            }
        };

        if (msgOrInteraction.acknowledge && !msgOrInteraction.acknowledged) {
            await msgOrInteraction.defer();
        }

        const nextLevelXp = LevelSystem.calculateNextLevelXP(userData.level);

        const canvasTexts = {
            level: translate("LEVEL", lang),
            wallet: translate("WALLET", lang),
            wins: translate("WINS", lang),
            losses: translate("LOSSES", lang)
        };

        const buffer = await CanvasUtil.drawProfile(targetUser, userData, nextLevelXp, canvasTexts);

        return reply(
            { content: translate("PROFILE_HEADER", lang, { user: targetUser.username }) },
            { file: buffer, name: "profile.jpg" }
        );
    }
};