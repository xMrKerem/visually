const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const db = require('quick.db');

exports.run = async (client, message) => {
    const prefix = db.has(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix;
    var embed = new Discord.MessageEmbed()
    .setAuthor(client.user.username, client.user.avatarURL())
    .setTitle('**__Yenilikler__**')
	.addField('**__Son güncelleme: v0.4.2__**', `**-** Hava durumu komudundaki sorunlar giderildi.\n \n**__Notlar__**\n**-** Visually onaylandığı için artık 100 sunucuyu geçebiliyor.\n**-** English language support is coming soon.`)
    .addField('**__Son büyük güncelleme: v0.4__**', `**-** Yenilikler menüsü eklendi.\n**-** Düello sistemi yenilendi. (Eski düello sistemi hala duruyor)\n**-** Botu etiketlediğinizde prefixini atar.\n**-** Sunucuya özel prefix belirlediğinizde menüleri o prefix ile atar.\n**-** Düello kaydını el ile silme komudu eklendi.\n \n**__Notlar__**\n**-** English language support is coming soon.`)
    .setFooter(`Daha geniş bilgi için destek sunucusu: ${prefix}davet`, client.user.avatarURL())
    .setColor('#5bfc89')
    message.channel.send(embed)
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['yenilikler', 'news', 'updates', 'update', 'güncelleme', 'güncellemeler'],
    permLeve: 0
};

exports.help = {
    name: 'Yenilikler',
    description: 'eğlence yardım menüsünü açar',
    usage: 'yenilikler'
}
