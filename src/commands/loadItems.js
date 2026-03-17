const fs = require('fs');
const path = require('path');
const StoreItem = require("../database/models/StoreItem");

module.exports = {
    name: "loaditems",
    description: "Config dosyasındaki tüm kategorileri rastgele ID'lerle DB'ye yükler.",
    permLevel: 5,

    slashCommand: {
        name: "loaditems",
        description: "Dev: Sync store.json to database with random IDs.",
        type: 1
    },

    execute: async (bot, msgOrInteraction, args) => {
        const sendMessage = async (content) => {
            if (msgOrInteraction.type === 1 || msgOrInteraction.type === 2) {
                return msgOrInteraction.createMessage
                    ? await msgOrInteraction.createMessage(content)
                    : await bot.createMessage(msgOrInteraction.channel.id, content);
            } else {
                return bot.createMessage(msgOrInteraction.channel.id, content);
            }
        };

        const generateRandomId = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 4; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        try {
            const configPath = path.join(__dirname, '../config/store.json');
            if (!fs.existsSync(configPath)) {
                return sendMessage("❌ store.json dosyası bulunamadı!");
            }

            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            let allItems = [];

            const categoryMap = {
                "chests": "chest",
                "weapons": "weapon",
                "shields": "shield",
                "heals": "heal",
                "techs": "tech"
            };

            for (const [jsonKey, items] of Object.entries(config)) {
                const category = categoryMap[jsonKey];
                if (!category) continue;

                for (const [slug, item] of Object.entries(items)) {
                    allItems.push({
                        customId: item.itemId,
                        searchName: item.name_en,
                        updateData: {
                            name: {
                                tr: item.name,
                                en: item.name_en
                            },
                            description: {
                                tr: item.description,
                                en: item.description_en
                            },
                            category: category,
                            price: item.price,
                            emoji: item.emoji,
                            rarity: item.rarity || "common",
                            stats: category === "chest" ? { contents: item.contents } : (item.stats || {}),
                            image: item.image,
                            openGif: item.openGif,
                            usageLimit: item.usageLimit,
                            expiresAt: item.expiresAt,
                            isBuyable: item.isBuyable,
                        }
                    });
                }
            }

            let added = 0;
            let updated = 0;

            for (const data of allItems) {
                const finalId = data.customId ? String(data.customId) : generateRandomId();

                    const res = await StoreItem.updateOne(
                        { "name.en": data.searchName },
                        {
                            $set: data.updateData,
                            $setOnInsert: { itemId: finalId }
                        },
                        { upsert: true }
                    );

                if (res.upsertedCount > 0) added++;
                else if (res.modifiedCount > 0) updated++;
            }

            return sendMessage(`✅ Senkronizasyon Tamam!\n🆕 Yeni Eklenen: **${added}**\n🔄 Güncellenen: **${updated}**`);

        } catch (err) {
            console.error(err);
            return sendMessage(`❌ Hata: ${err.message}`);
        }
    }
}