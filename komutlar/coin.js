const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message) => {

    let coin;
    const args = message.content.split(' ').slice(1)

    const kisi1 = message.mentions.users.first();
    let kisi;
    if (kisi1) {
        kisi = kisi1.id;
        
        if (!message.guild.members.cache.get(kisi)) {
            return message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
        }
    } else {
        if (args[0]) {
            kisi = args[0];
            
            if (!message.guild.members.cache.get(kisi)) {
                return message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
            }
        } else {
            kisi = message.author.id;
        }
    }

    const uye = message.guild.members.cache.get(kisi);

    if (await db.has('coin_' + uye.id)) {
        coin = db.fetch('coin_' + uye.id);
    } else {
        coin = 0;
    }

    message.channel.send(`${uye}, adlı kişinin coin miktarı: **${coin}**`)
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['coin', 'para'],
    permLevel: 0
};

exports.help = {
    name: 'coin',
    description: 'coinini gösterir',
    usage: 'coin'
};
