const StoreItem = require("../database/models/StoreItem");
const translate = require("../utils/Translate");

module.exports = {
    name: "additem",
    description: "Mağazaya yeni bir eşya ekler.",
    displayName: "additem",
    permLevel: 5,

    slashCommand: {
        name: "additem",
        description: "Add a new item to the store database.",
        type: 1,
        options: [
            { name: "item_id", description: "Unique ID (örn: shield_iron)", type: 3, required: true },
            { name: "category", description: "Kategori", type: 3, required: true, choices: [
                    { name: "Shield", value: "shield" },
                    { name: "Equip", value: "equip" },
                    { name: "Tech", value: "tech" },
                    { name: "Heal", value: "heal" }
                ]},
            { name: "price", description: "Fiyat", type: 4, required: true },
            { name: "name_tr", description: "Türkçe İsim", type: 3, required: true },
            { name: "name_en", description: "İngilizce İsim", type: 3, required: true },
            { name: "desc_tr", description: "Türkçe Açıklama", type: 3, required: true },
            { name: "desc_en", description: "İngilizce Açıklama", type: 3, required: true },
            { name: "min_power", description: "Min Güç", type: 4, required: true },
            { name: "max_power", description: "Max Güç", type: 4, required: true },
            { name: "usage_limit", description: "Kullanım Hakkı (-1 = Sonsuz)", type: 4, required: true },
            { name: "emoji", description: "Görünecek Emoji", type: 3, required: true },
            { name: "image", description: "Resim Linki (Opsiyonel)", type: 3, required: false }
        ]
    },

    execute: async (bot, msgOrInteraction, args) => {
        if (!msgOrInteraction.data) return bot.createMessage(msgOrInteraction.channel.id, "Lütfen bu komutu Slash (/) olarak kullanın.");

        const opts = msgOrInteraction.data.options.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.value }), {});

        try {
            const exist = await StoreItem.findOne({ itemId: opts.item_id });
            if (exist) return msgOrInteraction.createMessage({ content: "❌ Bu ID'ye sahip bir eşya zaten var!", flags: 64 });

            const newItem = new StoreItem({
                itemId: opts.item_id,
                category: opts.category,
                price: opts.price,
                name: {
                    tr: opts.name_tr,
                    en: opts.name_en
                },
                description: {
                    tr: opts.desc_tr,
                    en: opts.desc_en
                },
                minPower: opts.min_power,
                maxPower: opts.max_power,
                usageLimit: opts.usage_limit,
                emoji: opts.emoji,
                image: opts.image || ""
            });

            await newItem.save();

            return msgOrInteraction.createMessage({
                embed: {
                    title: "✅ Eşya Başarıyla Eklendi!",
                    description: `**${opts.emoji} ${opts.name_tr}** artık mağazada satışta!`,
                    color: 0x00ff00,
                    fields: [
                        { name: "ID", value: opts.item_id, inline: true },
                        { name: "Fiyat", value: `${opts.price}`, inline: true },
                        { name: "Kategori", value: opts.category, inline: true }
                    ]
                }
            });

        } catch (err) {
            console.error(err);
            return msgOrInteraction.createMessage({ content: "❌ Veritabanına eklerken bir hata oluştu.", flags: 64 });
        }
    }
};