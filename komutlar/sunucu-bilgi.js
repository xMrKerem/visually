const Discord = require('discord.js');
const moment = require('moment');
const ayarlar = require('../ayarlar.json');

exports.run = (client, message, params) => {
    let kur = {
     "01": "Ocak",
     "02": "Şubat",
     "03": "Mart",
     "04": "Nisan",
     "05": "Mayıs",
     "06": "Haziran",
     "07": "Temmuz",
     "08": "Ağustos",
     "09": "Eylül",
     "10": "Ekim",
     "11": "Kasım",
     "12": "Aralık"
    }
    if (message.channel.type == 'dm') return;
    const sunucubilgi = new Discord.MessageEmbed()
    .setColor('#2F3136')
    .setAuthor(message.guild.name + ` (ID: ${message.guild.id})`, message.guild.iconURL())
    .addField('**__Bölge__**', message.guild.region)
    .addField('**__Sunucu sahibi__**', message.guild.owner + ` (ID: ${message.guild.ownerID})`)
    .addField('**__Üye sayısı__**', message.guild.members.cache.size + `(${message.guild.members.cache.array().filter(x => x.bot == true).length} bot)`)
    .addField('**__Oluşturulma tarihi__**', `${moment(message.guild.createdAt).format('DD')} ${kur[moment(message.guild.createdAt).format('MM')]} ${moment(message.guild.createdAt).format('YYYY hh:mm:ss')}`)
    .setFooter(client.user.username, client.user.avatarURL())
    message.channel.send(sunucubilgi);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["sunucubilgi", "sunucu-bilgi", "serverinformation", "server-information", "serveri", "server-i"],
  permLevel: 0
};

exports.help = {
  name: 'sunucubilgi',
  description: 'Sunucu hakkında bilgi verir.',
  usage: 'sunucubilgi'
};
