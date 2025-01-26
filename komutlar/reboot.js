const Discord = require('discord.js');
const db = require('quick.db')

exports.run = async (client, message) => {

if (message.author.id == "381137379290775555") {
  message.channel.send("Bot yeniden başlatılıyor...")
  db.set(`reboot`, message.channel.id)
  process.exit(0)
}
};

exports.conf = {
  enabled: true, 
  guildOnly: false, 
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'reboot', 
  description: 'Botu yeniden başlatır',
  usage: 'reboot'
};
