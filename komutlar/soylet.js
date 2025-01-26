const Discord = require('discord.js');


exports.run = async (client, message) => {
  
  if (message.content.toLowerCase().includes('@everyone') || message.content.toLowerCase().includes('@here')) return message.reply('ÇAKAL ALARMI')
  
  const args = message.content.split(' ').slice(1);
  const soylet = args.slice(0).join(' ')
  if (!soylet) return message.reply('Ne yazdıracaksın?')
  message.channel.send(soylet)
  message.delete()
}

exports.conf = {
  enabled: true, 
  guildOnly: false, 
  aliases: ["söylet", "tell"],
  permLevel: 0
};

exports.help = {
  name: 'söylet', 
  description: 'uyarı verir',
  usage: 'söylet'
};
