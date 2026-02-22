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
        enum: ["shield", "equip", "tech"]
    },

    price: {
        type: Number,
        required: true,
    },

    power: {
        type: Number,
        required: true,
    },

    usageLimit: {
        type: Number,
        default: 0,
    },

    emoji: {
        type: String,
        default: "⚔️",
    }
})

module.exports = mongoose.model("StoreItem", storeItemSchema)