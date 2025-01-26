const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message) => {

    if (message.channel.type == 'dm') return message.reply('bu komutu özel mesajlar kısmında kullanamazsın.')

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('bu komutu kullanmak için yetkin yok bu komutu kullanmak için `YÖNETİCİ` yetkisi gerekli.').then(msg => msg.delete({timeout: 5000}))
    if (message.member.hasPermission('ADMINISTRATOR')) {

    var kanal = message.mentions.channels.first()
    if (!kanal) return message.reply('lütfen geçerli bir kanal belirtiniz.').then(msg => msg.delete({timeout: 5000}))
    var hoşgeldin = message.guild.channels.cache.get(kanal.id)

    db.set('hoşgeldin_' + message.guild.id, hoşgeldin.id)
    message.reply('başarı ile bu sunucudaki hoşgeldin kanalımı <#' + hoşgeldin.id + '> yaptım.')
}
};


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['hoşgeldin-kanalı-ayarla', 'hoşgeldin-ayarla', 'hoşgeldinkanalıayarla', 'hoşgeldinayarla', 'welcome-set', 'welcomeset'],
    permLevel: 0
};

exports.help = {
    name: 'Hoşgeldin Kanalı Ayarla',
    description: "Hoşgeldin Masajı Atmak İçin Kanal Ayarlar",
    usage: 'hoşgeldin-kanalı-ayarla'
}
