const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message) => {
    
    const embed = new Discord.MessageEmbed().setAuthor('Visually', client.user.avatarURL()).setThumbnail(message.author.avatarURL({dynamic: true})).setDescription(`**${message.author} Herkese Çay Gönderdi.**`).setImage('https://cdn.discordapp.com/attachments/762047051533123584/773528084170145792/tenor.gif').setFooter(`Komutu Çalıştıran Kişi ${message.author.tag}`, message.author.avatarURL()).setColor('6D1007');
    message.channel.send(embed)
};


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['herkeseçay', 'herkese çay', 'teas', 'tea-everbody'],
    permLevel: 0
};

exports.help = {
    name: 'herkese çay',
    description: 'herkese çay gönderir',
    usage: 'herkeseçay'
};
