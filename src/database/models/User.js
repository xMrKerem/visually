const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },

    usernName: {
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
    }
});

module.exports = mongoose.model("User", userSchema);