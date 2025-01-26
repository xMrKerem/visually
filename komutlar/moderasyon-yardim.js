const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const db = require('quick.db');

exports.run = async (client, message) => {

    if (await db.has('prefix_' + message.guild.id)) {
        prefix = db.fetch('prefix_' + message.guild.id)
    } else {
        prefix = ayarlar.prefix
    }

    var embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('Moderasyon Yardım Menüsü')
    .addField(`**\`${prefix}ban\`**`, `**${prefix}ban komutu ile istediğiniz birini sunucudan ban atabilirsiniz.\nKullanımı: \`${prefix}ban <kullanıcı etiket> <sebep>\`**`)
    .addField(`**\`${prefix}kick\`**`, `**${prefix}kick komutu ile istediğiniz birini sunucudan atabilirsiniz.\nKullanımı: \`${prefix}kick <kullanıcı etiket> <sebep>\`**`)
    .addField(`**\`${prefix}uyar\`**`, `**${prefix}uyar komutu ile istediğiniz kişiye uyarı verebilirsiniz.\nKullanımı: \`${prefix}uyar <kullanıcı etiket> <sebep>\`**`)
    .addField(`**\`${prefix}sustur\`**`, `**${prefix}sustur komutu ile istediğiniz birini sunucuda susturabilirsiniz.\nKullanımı: \`${prefix}sustur <kullanıcı etiket> <süre> <sebep>\`\nSüre ile bilgi almak için: \`${prefix}süre-bilgi\`**`)
    .addField(`**\`${prefix}temizle\`**`, `**${prefix}temizle komutu ile kanaldaki son 1-100 arasındaki mesajları silebilirsiniz.\nKullanımı: \`${prefix}temizle <miktar>\`**`)
    .addField(`**\`${prefix}süre-bilgi\`**`, `**${prefix}süre-bilgi komutu susturma süresi hakkında bilgi verir.\nKullanımı: \`${prefix}süre-bilgi\`**`)
    .setColor('DARK_RED')
    message.channel.send(embed)
};


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['moderasyon', 'moderasyon-yardım', 'moderasyonyardım', 'moderation-help', 'moderationhelp'],
    permLevel: 0
};

exports.help = {
    name: 'moderasyon yardım',
    description: 'moderasyon yardım menüsünü açar',
    usage: 'moderasyon'
}