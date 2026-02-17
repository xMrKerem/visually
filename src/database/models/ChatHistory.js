const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    history: [
        {
            role: {
                type: String,
                enum: ["user", "model"],
                required: true
            },

            parts: [{
                text: {
                    type: String,
                    required: true
                }
            }],

            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],

    lastInteraction: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);