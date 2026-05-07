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
    },

    xpMultiplier: {
        type: Number,
        default: 1.0
    },

    levelLogChannel: {
        type: String,
        default: null
    },

    roleBehavior: {
        type: String,
        enum: ["stack", "replace"],
        default: "replace"
    },

    isDropsEnabled: {
        type: Boolean,
        default: true
    },

    levelRoles: {
        type: Map,
        of: String,
        default: {}
    }
});

module.exports = mongoose.model("Guild", guildSchema);