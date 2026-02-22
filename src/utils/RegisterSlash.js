const fs = require("fs");
const path = require("path");

const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    reset: "\x1b[0m",
    yellow: "\x1b[33m"
};

module.exports = async (bot) => {
    console.log(`${colors.yellow}[*] Slash komutları taranıyor ve yükleniyor...${colors.reset}`);

    const commandsToRegister = [];
    const commandsPath = path.join(__dirname, "../commands");

    if (!fs.existsSync(commandsPath)) {
        console.error(`${colors.red}[-] 'commands' klasörü bulunamadı!${colors.reset}`);
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

        if (command.slashCommand) {
            if (!command.slashCommand.type) {
                command.slashCommand.type = 1;
            }

            commandsToRegister.push(command.slashCommand);
            console.log(`${colors.green}[+] Yüklenecek: /${command.slashCommand.name}${colors.reset}`);
        }
    }

    if (commandsToRegister.length > 0) {
        try {
            await bot.bulkEditCommands(commandsToRegister);
            console.log(`${colors.green}[+] Başarılı! Toplam ${commandsToRegister.length} slash komutu Discord'a kaydedildi.${colors.reset}`);
        } catch (e) {
            console.error(`${colors.red}[-] Slash Komut Yükleme Hatası:${colors.reset}`, e);
            if (e.response) console.error(JSON.stringify(e.response, null, 2));
        }
    } else {
        console.log(`${colors.red}[-] Yüklenecek slash komutu bulunamadı.${colors.reset}`);
    }
    console.log("-".repeat(30))
};