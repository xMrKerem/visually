const mongoose = require("mongoose");

const WarningSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    moderatorId: {
        type: String,
        required: true
    },

    reason: {
        type: String,
        default: "No reason provided."
    },

    date: {
        type: Date,
        default: Date.now
    },

    warnId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Warning", WarningSchema);