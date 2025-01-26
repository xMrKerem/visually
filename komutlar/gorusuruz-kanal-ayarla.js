const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message) => {

    if (message.channel.type == 'dm') return message.reply('bu komutu özel mesajlar kısmında kullanamazsın.')

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('bu komutu kullanmak için yetkin yok bu komutu kullanmak için `YÖNETİCİ` yetkisi gerekli.').then(msg => msg.delete({timeout: 5000}))
    if (message.member.hasPermission('ADMINISTRATOR')) {

    var kanal = message.mentions.channels.first()
    if (!kanal) return message.reply('lütfen geçerli bir kanal belirtiniz.').then(msg => msg.delete({timeout: 5000}))
    var görüşürüz = message.guild.channels.cache.get(kanal.id)

    db.set('görüşürüz_' + message.guild.id, görüşürüz.id)
    message.reply('başarı ile bu sunucudaki görüşürüz kanalımı <#' + görüşürüz.id + '> yaptım.')
    return
}
};


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["görüşürüz-kanalı-ayarla", "görüşürüz-ayarla", "görüşürüzkanalıayarla", "görüşürüzayarla", "see-you-set", "seeyouset"],
    permLevel: 0
};

exports.help = {
    name: "görüşürüz Kanalı Ayarla",
    description: "görüşürüz Masajı Atmak İçin Kanal Ayarlar",
    usage: "görüşürüz-kanalı-ayarla"
}