const Discord = require('discord.js');

exports.run = async (client, message) => {

    var embed = new Discord.MessageEmbed()
        .setAuthor('Visually', client.user.avatarURL())
        .setTitle('Düello Yardım Menüsü')
        .addField('**Mana Nedir?**', '**Düello sistemine yeni gelen mana sistemi yetenekleri kullanmak için gereklidir.**')
        .addField('**Mana Nasıl Kazanılır?**', '**Mana kazanmak için yumruk ile saldırı yapmanız gerekiyor. Her yumruk attığınızda 20 ile 80 arası mana kazanırsınız.**')
        .addField('**Hangi Özellik Ne Kadar Mana İstiyor?**', '**Yumruk = 0 Mana\nSavun = 30 Mana\nTekmele = 50 Mana\nUltra Güç = 300 Mana\nCan Yenile = 400 Mana**')
        .addField('**Coin Nedir?**', '**Coin için henüz bir işlev yoktur ileride coinler ile kendinize kılıç alıp güçlendirebileceksiniz.**')
        .setFooter(`komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL())
        .setColor('RED')
    message.channel.send(embed)
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['düelloyardım', 'düello-yardım', 'duel-help', 'duelhelp'],
    permLeve: 0
};

exports.help = {
    name: 'düello yardım',
    description: 'eğlence yardım menüsünü açar',
    usage: 'düello-yardım'
}