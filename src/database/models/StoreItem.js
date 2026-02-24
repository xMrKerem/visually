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
        enum: ["shield", "equip", "tech", "heal"]
    },

    price: {
        type: Number,
        required: true,
    },

    maxPower: {
        type: Number,
        required: true,
    },

    minPower: {
        type: Number,
        required: true,
    },

    usageLimit: {
        type: Number,
        default: -1,
    },

    emoji: {
        type: String,
        default: "⚔️",
    }
})

module.exports = mongoose.model("StoreItem", storeItemSchema)