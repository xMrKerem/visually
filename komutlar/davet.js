const Discord = require('discord.js');


exports.run = async (client, message) => {

    const embed = new Discord.MessageEmbed()
    .setAuthor(client.user.username, client.user.avatarURL())
    .setTitle(`[Davet linki](https://discord.com/oauth2/authorize?client_id=770753250902147092&scope=bot&permissions=2146958847)`)
    .setDescription(`[Destek sunucusu](https://discord.gg/dAVcz9zK7g)\n[Bota oy verin](https://top.gg/bot/770753250902147092/vote)`)
    .setColor('#2F3136')
    message.channel.send(embed)
}


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['davet', 'link', 'davetim', 'invite'],
    permLevel: 0
}

exports.help = {
    name: 'davet',
    description: 'botun davet linkini atar',
    usage: 'davet'
}
