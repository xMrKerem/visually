const registerSlash = require("../utils/RegisterSlash");
let slashRegistered = false;
let systemStarted = false;

const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    reset: "\x1b[0m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

module.exports = {
    name: "ready",
    execute: async (bot) => {
        if (systemStarted) return;
        console.log(`${colors.cyan}[+] ${bot.user.username}is ready!${colors.reset}`);
        console.log(`${colors.yellow}[*] Users: ${bot.users.size} | Servers: ${bot.guilds.size}${colors.reset}`);
        console.log("-".repeat(30))

        bot.editStatus("online", {
            name: `${process.env.PREFIX}help | Visually V2.0`,
            type: 3
        });

        if (!slashRegistered) {
            await registerSlash(bot);
            slashRegistered = true;
        }
        systemStarted = true;
    }
}