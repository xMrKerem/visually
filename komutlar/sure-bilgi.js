const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message) => {

    var embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('Süre Bilgi')
    .addField('Susturma Süreleri', '**15 saniye = 15s\n15 dakika = 15m\n15 saat = 15h\n15 gün = 15d\n15 yıl = 15y**')
    .setFooter(`Komutu Çalıştıran Kişi ${message.author.tag}`, message.author.avatarURL({dynamic: true}))
    .setColor('GREEN')
    message.channel.send(embed)
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['süre-bilgi', 'sürebilgi', 'süre', 'timeinformation', 'time-information', 'time-i'],
    permLevel: 0
};

exports.help = {
    name: 'süre bilgi',
    description: 'moderasyon yardım menüsünü açar',
    usage: 'süre-bilgi'
}