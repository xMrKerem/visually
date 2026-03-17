const mongoose = require("mongoose")

const storeItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        tr: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        }
    },

    description: {
        tr: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        }
    },

    image: {
        type: String,
        default: "",
    },

    category: {
        type: String,
        required: true,
        enum: ["shield", "weapon", "tech", "heal", "chest", "mythic"]
    },

    price: {
        type: Number,
        required: true,
    },

    stats: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },

    usageLimit: {
        type: Number,
        default: -1,
    },

    emoji: {
        type: String,
        default: "⚔️",
    },

    expiresAt: {
        type: Date,
        default: null
    },

    rarity: {
        type: String,
        required: true,
        enum: ["common", "rare", "epic", "legendary"]
    },

    isBuyable: {
        type: Boolean,
        default: true
    },

    openGif: {
        type: String,
    }
})

module.exports = mongoose.model("StoreItem", storeItemSchema)