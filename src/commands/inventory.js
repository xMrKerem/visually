const User = require("../database/models/User");
const translate = require("../utils/Translate");
const tr = require("../locales/tr.json");
const en = require("../locales/en.json");
const {models} = require("mongoose");

const getLocalization = (keyname) => {
    return { "tr": tr[keyname] };
}

module.exports = {
    name: "inventory",
    description: "CMD_DESC_INVENTORY",
    displayName: "CMD_NAME_INVENTORY",
    aliases: ["çanta", "envanter", "inv", "bag"],
    permLevel: 0,

    slashCommand: {
        name: "inventory",
        name_localizations: getLocalization("CMD_NAME_INVENTORY"),
        description: en.CMD_DESC_INVENTORY,
        description_localizations: getLocalization("CMD_DESC_INVENTORY"),
        type: 1,
        options: [
            {
                name: "user",
                description: "Whose inventory do you want to see?",
                description_localizations: { "tr": "Kimin envanterine bakmak istiyorsun?" },
                type: 6,
                required: false
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en"

        let targetUser;

        if (msgOrInteraction.data && msgOrInteraction.data.options && msgOrInteraction.data.options[0]) {
            const targetId = msgOrInteraction.data.options[0].value;
            targetUser = bot.users.get(targetId) || await bot.getRESTUser(targetId);
        }
        else if (msgOrInteraction.mentions && msgOrInteraction.mentions.length > 0) {
            targetUser = msgOrInteraction.mentions[0];
        }
        else {
            targetUser = msgOrInteraction.member ? msgOrInteraction.member.user : msgOrInteraction.author;
        }

        const reply = async (payload) => {
            if (msgOrInteraction.createMessage && !msgOrInteraction.author) {
                return await msgOrInteraction.createMessage(payload);
            } else {
                return await bot.createMessage(msgOrInteraction.channel.id, payload);
            }
        }

        const user = await User.findOne({ userId: targetUser.id });

        if (!user || !user.inventory || !user.inventory.length) {
            return reply({
                embed: {
                    title: "🎒" + translate("INVENTORY_TITLE", lang),
                    description: translate("INVENTORY_EMPTY", lang),
                    color: 0xe74c3c,
                }
            })
        }

        const itemsList = user.inventory.map((item, index) => {
            const limitText = item.uses === -1 ? "∞" : item.uses;
            return `**${index + 1}.** ${item.name[lang]} \n└ 📦 Adet: **${item.amount}** | 🔄 Hak: **${limitText}**`;
        }).join("\n\n");

        return reply({
            embed: {
                title: `🎒 ${targetUser.username}` + translate("INVENTORY_TITLE", lang),
                description: itemsList,
                color: 0x2ecc71,
                fields: [
                    {
                        name: "💰" + translate("WALLET", lang),
                        value: `**${user.balance}** Coin`,
                        inline: true
                    },
                    {
                        name: "⚖️ Toplam Eşya",
                        value: `**${user.inventory.length}** Parça`,
                        inline: true
                    }
                ],
                thumbnail: { url: bot.user.dynamicAvatarURL("png", 256) }
            }
        });
    }
}