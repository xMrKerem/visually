const Discord = require('discord.js');
const db = require('quick.db');


exports.run = async (client, message) => {

    if (message.channel.type == "dm") return message.reply('Bu komutu Özel Mesajlarda Kullanamazsın')

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Bu komutu kullanmak için `YÖNETİCİ` yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))
    if (message.member.hasPermission('ADMINISTRATOR')) {

    var kanal = message.mentions.channels.first()
    if (!kanal) return message.reply('Bir kanal belirtmelisin.').then(msg => msg.delete({timeout: 5000}))
    var log = message.guild.channels.cache.get(kanal.id)

        if (!client.channes.cache.has(log.id)) return message.reply('bu kanalı göremiyorum.')

    db.set('log_' + message.guild.id, log.id)
    message.reply('Başarı ile bu sunucuda log kanalımı <#' + log + '> yaptım.')
    }
}


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["log-ayarla", "log", "log-set", "logset"],
    permLevel: 0
};

exports.help = {
    name: "log ayarla",
    description: "log kanalı ayarlar",
    usage: "log-ayarla"
}