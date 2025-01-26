const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const db = require('quick.db');

exports.run = async (client, message) => {
    const prefix = db.has(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix;
    const embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('Bot Yardım Menüsü')
    .addField(`**\`${prefix}ping\`**`, `**${prefix}ping komutu ile botun pingini öğrenebilirsiniz.\nKullanımı: \`${prefix}ping\`**`)
    .addField(`**\`${prefix}istatistik\`**`, `**${prefix}istatistik komutu botun istatiklerini gösterir.\nKullanımı: \`${prefix}istatistik\`**`)
    .addField(`**\`${prefix}davet\`**`, `**${prefix}davet komutu botun davet linkini atar.\nKullanımı: \`${prefix}davet\`**`)
    .addField(`**\`${prefix}reboot\`**`, `**${prefix}reboot komutu botu yeniden başlatır \`YAPIMCI ÖZEL KOMUTTUR!\`\nKullanımı: \`${prefix}reboot\`**`)
    .addField(`**\`${prefix}yenilikler\`**`, `**${prefix}yenilikler komutu bota yeni gelen özellikleri gösterir.\nKullanımı: \`${prefix}yenilikler\`**`)
    .setFooter(`Komutu Çalıştıran Kişi ${message.author.tag}`, message.author.avatarURL({dynamic: true}))
    .setColor('GREEN')
    message.channel.send(embed)
}


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['botyardım', 'bot-yardım', 'bot', 'bot-help', 'bothelp'],
    permLevel: 0
};

exports.help = {
    name: 'bot',
    description: 'botun yardım menüsünü açar',
    usage: 'bot'
};
