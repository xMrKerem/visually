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

    kp: {
        type: Number,
        default: 0
    },

    rankTier: {
        type: Number,
        default: 1
    },

    shield: {
        type: Boolean,
        default: false
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
    },

    topgg: {
        lastVoteAt: { type: Date, default: null },
        lastVoteClaimedAt: { type: Date, default: null },
        lastVoteType: { type: String, default: null },
        lastIsWeekend: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model("User", userSchema);