const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    prefix: {
        type: String,
        default: process.env.PREFIX
    },

    language: {
        type: String,
        default: "en"
    },

    autorole: {
        type: String,
        default: null
    },

    welcomeChannel: {
        type: String,
        default: null
    },

    goodbyeChannel: {
        type: String,
        default: null
    },

    logChannel: {
        type: String,
        default: null
    },

    slangMode: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Guild", guildSchema);