const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {

    message.delete()

    if (message.member.hasPermission("MANAGE_MESSAGES")) {

    adet = args[0]
    if (!adet) return  message.reply('**mesaj silebilmem için ``1-100`` arası bir sayı girmen gerek.**').then(msg => msg.delete({timeout: 5000}))

    if (adet > 100) return message.reply('**100 veya 100\'den küçük bir rakam giriniz!**').then(msg => msg.delete({timeout: 5000}))

    if (adet < 1) return message.reply('**1 veya 1\'den büyük bir rakam giriniz!**').then(msg => msg.delete({timeout: 5000}))
    
    message.channel.bulkDelete(adet);

    var embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('**Son Mesajlar Silindi**')
    .setThumbnail(message.author.avatarURL({dynamic: true}))
    .addField('**Silen Kişi**', `**<@${message.author.id}>**`, true)
    .addField('**Sildiği Mesaj Sayısı**', `**${adet}**`, true)
    .setFooter(`Komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL({dynamic: true}))
    .setColor('GREEN')
    message.channel.send(embed)
    return
    };

    message.reply('Bu komutu kullanmak için **Mesajları Yönet** iznine sahip olman gerek.').then(msg => msg.delete({timeout: 5000}))
};


exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['temizle', 'sil', 'clear'],
    permLevel: 0
}

exports.help = {
    name: 'temizle',
    description: 'istediğiniz miktarda mesajı temizler',
    usage: 'temizle'
}