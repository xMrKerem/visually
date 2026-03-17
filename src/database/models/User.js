const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },

    userName: {
        type: String,
        required: true,
        default: "undefined"
    },

    balance: {
        type: Number,
        default: 0
    },

    lastDaily: {
        type: Date,
        default: null
    },

    xp: {
        type: Number,
        default: 0
    },

    level: {
        type: Number,
        default: 1
    },

    wins: {
        type: Number,
        default: 0
    },

    losses: {
        type: Number,
        default: 0
    },

    inventory: {
        type: Array,
        default: []
    },

    equipment: {
        weapon: {
            type: String,
            default: null
        },

        shield: {
            type: String,
            default: null
        },

        tech: {
            type: String,
            default: null
        },

        heal: {
            type: String,
            default: null
        }
    }
});

module.exports = mongoose.model("User", userSchema);