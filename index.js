const Eris = require("eris");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    reset: "\x1b[0m",
    yellow: "\x1b[33m"
};

const bot = new Eris(process.env.TOKEN, {
    intents: ["guilds", "guildMessages", "messageContent", "guildMembers"],
    getAllUsers: true,
    messageLimit: 100,
    defaultImageFormat: "png",
    defaultImageSize: 1024,
    restMethod: true,
    requestTimeout: 60000,
});

bot.commands = new Map();
bot.aliases = new Map();
bot.prefixCache = new Map();

const loadCommands = () => {
    const commandsDir = path.join(__dirname, "src", "commands");
    if (!fs.existsSync(commandsDir)) return console.log(`${colors.red}[-] 'src/commands' klasörü bulunamadı!${colors.reset}`);

    const files = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));

    for (const file of files) {
        const fullPath = path.join(commandsDir, file);

        try {
            delete require.cache[require.resolve(fullPath)];
            const cmd = require(fullPath);

            if (!cmd.name) {
                console.log(`${colors.red}[-] ${file} dosyasında 'name' eksik, atlandı.${colors.reset}`);
                continue;
            }

            bot.commands.set(cmd.name, cmd);

            if (cmd.aliases && Array.isArray(cmd.aliases)) {
                cmd.aliases.forEach((alias) => bot.aliases.set(alias, cmd.name));
            }
            console.log(`${colors.green}[+] ${cmd.name} başarıyla yüklendi.${colors.reset}`);

        } catch (err) {
            console.error(`${colors.red}[-] ${file} yüklenirken hata oluştu:${colors.reset} `, err);
        }
    }
    console.log("-".repeat(30))
};

const loadEvents = () => {
    const eventsPath = path.join(__dirname, "src", "events");
    if (!fs.existsSync(eventsPath)) return console.log(`${colors.red}[-] 'src/events' klasörü bulunamadı!${colors.reset}`);

    const files = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const filePath = path.join(eventsPath, file);
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);
            const eventName = file.split(".")[0];

            if (!event || typeof event.execute !== 'function') {
                console.error(`${colors.red}[-] ${file} dosyasında 'execute' fonksiyonu bulunamadı!${colors.reset}`);
                continue;
            }

            bot.on(eventName, (...args) => event.execute(bot, ...args));
            console.log(`${colors.green}[+] Event Yüklendi: ${eventName}${colors.reset}`);

        } catch (err) {
            console.error(`${colors.red}[-] ${file} yüklenirken hata oluştu:${colors.reset} `, err);
        }
    }
    console.log("-".repeat(30))
};

process.on("unhandledRejection", (reason, p) => {
    console.error(`${colors.red}[DEBUG] Undetected Promise Fault:${colors.reset} `, reason);
});

process.on("uncaughtException", (reason, origin) => {
    console.error(`${colors.red}[DEBUG] Unexpected Error:${colors.reset} `, reason);
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(`${colors.green}Visually: MongoDB connection successful.${colors.reset}`);
        loadCommands();
        loadEvents();
        return bot.connect();
    })
    .catch(err => console.log(`${colors.red}Database connection error:${colors.reset} `, err));