const Dicord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const db = require('quick.db');

exports.run = async (client, message) => {
    const prefix = db.has(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix;
    const embed = new Dicord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('**__Genel komutlar__**')
    .addField(`**\`${prefix}eğlence\`**`, 'Eğlence yardım menüsünü açar.')
    .addField(`**\`${prefix}moderasyon\`**`, 'Moderasyon yardım menüsünü açar.')
    .addField(`**\`${prefix}admin\`**`, 'Admin yardım menüsünü açar.')
    .addField(`**\`${prefix}bot\`**`, 'Bot ile ilgili yardım menüsünü açar.')
    .setFooter(message.author.username, message.author.avatarURL())
    .setColor('#c2c2c2')
    message.channel.send(embed)
}

exports.conf = {
    enabled: true, 
    guildOnly: true, 
    aliases: ["help", "yardım"],
    permLevel: 0 
  };
  
  exports.help = {
    name: 'yardım', 
    description: 'Yardım panelini açar',
    usage: 'yardım'
  };
