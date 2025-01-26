const Discord = require('discord.js');
const db = require('quick.db');


exports.run = async (client, message, args) => {

  if (message.channel.type == "dm") return message.reply('Bu komutu Özel Mesajlarda Kullanamazsın')

  if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Bu komutu kullanmak için `YÖNETİCİ` yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))
  if (message.member.hasPermission('ADMINISTRATOR')) {
  
  var pf = args[0]
  if (!pf) return message.reply('Lütfen prefix belirtiniz').then(msg => msg.delete({timeout: 5000}))
  
  db.set("prefix_" + message.guild.id, pf)
  message.channel.send('Bu sunucu için prefiximi başarı ile **' + pf + '** yaptım')
  }
}


exports.conf = {
  enabled: true, 
  guildOnly: true, 
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'prefix', 
  description: 'Botun Prefixini Yani Önekini Değiştirmek İstiyorsan Bu Komut Tam Senlik!',
  usage: 'prefix'
};