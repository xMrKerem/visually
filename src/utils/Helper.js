const axios = require("axios");
const crypto = require("crypto");
const {models} = require("mongoose");

const yes = ["evet", "kabul ediyorum", "ediyorum", "evt", "yes", "y", "e"]
const no = ["hayır", "kabul etmiyorum", "etmiyorum", "hyr", "no", "n", "h"]

class VisuallyUtils {

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static shuffle(array) {
        const arr = array.slice(0);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static list(arr, conj = "ve") {
        const len = arr.length;
        if (len === 0) return '';
        if (len === 1) return arr[0];
        return `${arr.slice(0, - 1).join(', ')} ${conj} ${arr.slice(-1)}`;
    }

    static shorten(text, maxLen = 2000) {
        return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
    }

    static duration(ms) {
        const sec = Math.floor((ms / 1000) % 60).toString().padStart(2, "0");
        const min = Math.floor(ms / (1000 * 60) % 60).toString().padStart(2, "0");
        const hours = Math.floor(ms / (1000 * 60 * 60)).toString().padStart(2, "0");
        return `${hours}:${min}:${sec}`;
    }

    static randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static  base64(text, mode = "encode") {
        if (mode === "encode") return Buffer.from(text).toString("base64");
        if (mode === "decode") return Buffer.from(text, "base64").toString("utf8");
        throw new TypeError(`${mode} desteklenen bir base64 değil`);
    }

    static async randomFromImgurAlbum(album) {
        try {
            const { data } = await axios.get(`https://api.imgur.com/3/album/${album}`, {
                headers: { authorization: `Client-ID ${process.env.IMGUR_API_KEY}` },
            });

                if (!data.data.images.length) return null;
                return data.data.images[Math.floor(Math.random() * data.data.images.length)].link;
        } catch (e) {
            console.error("IMGHUR Error: ", e);
        }
    }

    static async waitForMessage(bot, channelID, filter, time = 30000) {
        return new Promise(resolve => {
            const listener  = (msg) => {
                if (msg.channel.id !== channelID) return;

                if (filter(msg)) {
                    bot.removeListener("messageCreate", listener);
                    resolve(msg);
                }
            };
            bot.on("messageCreate", listener);

            setTimeout(() => {
                bot.removeListener("messageCreate", listener);
                resolve(null);
            }, time);
        });
    }

    static async verify(bot, channelID, userID, time = 30000) {
        const filter = (msg) => {
            const content = msg.content.toLowerCase();
            return msg.author.id === userID && (yes.includes(content) || no.includes(content));
        };
        const message = await VisuallyUtils.waitForMessage(bot, channelID, filter, time);

        if (!message) return false;

        const choice = message.content.toLowerCase();
        return yes.includes(choice);
    }
}

module.exports = VisuallyUtils;