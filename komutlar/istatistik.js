const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const ayarlar = require('../ayarlar.json');

exports.run = (client, message) => {

  const duration = moment.duration(client.uptime).format(" D [gün], H [saat], m [dakika], s [saniye]");

  var embed = new Discord.MessageEmbed()
  .setAuthor('Visually', client.user.avatarURL())
  .setTitle('**­İSTATİKLER**')
  .addField('Kullanıcılar', client.users.cache.size)
  .addField('Sunucular', client.guilds.cache.size)
  .addField('Kanallar', client.channels.cache.size)
  .addField('Botun Son Yeniden Başlatılma', duration)
  .addField('RAM Kullanımı', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
  message.channel.send(embed)
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['i', 'istatisik', 'stats', 'stat', 'statistics'],
  permLevel: 0
};

exports.help = {
  name: 'istatistik',
  description: 'Botun istatistik gösterir.',
  usage: 'istatistik'
};