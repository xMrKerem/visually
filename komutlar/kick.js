const Discord = require('discord.js');
const db = require('quick.db')
const ayarlar = require('../ayarlar.json')

exports.run = async (client, message) => {

  message.delete()

    if (!message.guild.me.hasPermission("KICK_MEMBERS")) return message.reply('**Görünüşe göre bu sunucuda ``Üyeleri At`` yetkim bulunmuyor. Bir sunucu yetkilisine gidip bota bu yetkiyi vermesini iste.**')

    if (message.member.hasPermission("KICK_MEMBERS")) {

if (!await db.has('log_' + message.guild.id)) {
  return message.reply('Bu sunucu için bir log kanalı bulamıyorum log kanalı ayarlamak için `-log-ayarla <#kanal>`')
} else {
  var log = db.fetch('log_' + message.guild.id)
}

        if (!client.channels.cache.has(log)) return message.reply('bu sunucuda belirlenen log kanalı silinmiş veya göremiyorum.')

    const args = message.content.split(' ').slice(1)

    var kisi1 = message.mentions.users.first()
    if (!kisi1) {
        if (args[0]) {
            var kisi = args[0]

            if (!message.guild.members.cache.get(kisi)) {
                message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
                return
            }
        } else {
            message.reply('kimi atacağım?').then(msg => msg.delete({timeout: 5000}))
            return
        }
    } else {
        var kisi = kisi1.id

        if (!message.guild.members.cache.get(kisi)) {
            message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
            return
        }
    }

    var uye = message.guild.members.cache.get(kisi)

        if (message.guild.me.roles.highest.position <= uye.roles.highest.position) return message.reply('bu kullanıcının rolleri benim üstümde.').then(msg => msg.delete({timeout: 5000}))
        if (message.member.roles.highest.position <= uye.roles.highest.position) return message.reply('bu kullanıcının rolleri senin üstünde.').then(msg => msg.delete({timeout: 5000}))
        if (uye.id === message.author.id) return message.reply('**kendini atamazsın!**').then(msg => msg.delete({timeout: 5000}))
        if (uye.id === client.user.id) return message.reply('**benim komutumla beni atamazsın!**').then(msg => msg.delete({timeout: 5000}))

const sebep = args.slice(1).join(' ')
//if (!sebep) sebep = 'Sebep Belirtilmedi.' //return message.reply('sebep belirtmelisin sebepsiz birisini atamam.').then(msg => msg.delete({timeout: 5000}))

var embed = new Discord.MessageEmbed()

.setAuthor('Visually', client.user.avatarURL())
.setTitle('**Bir Yetkili Çekicini Salladı!**')
.setThumbnail(uye.user.avatarURL({dynamic: true}))
.addField('Atan Kişi', `<@${message.author.id}>`, true)
.addField('Atılan Kişi', uye, true)
.addField('Atma Sebebi', `${sebep ? sebep : "Sebep Belirtilmedi."}`)
//.setImage('https://cdn.discordapp.com/attachments/762047051533123584/772542454942531604/tenor.gif')
.setColor('RED')
message.channel.send(embed)
message.guild.member(kisi).kick({reason: sebep ? sebep : "Sebep Belirtilmedi."})

var logembed = new Discord.MessageEmbed()

.setAuthor('Visually', client.user.avatarURL())
.setTitle('**Bir Yetkili Çekicini Salladı!**')
.setThumbnail(uye.user.avatarURL({dynamic: true}))
.addField('Atan Kişi', `<@${message.author.id}>`, true)
.addField('Atılan Kişi', uye, true)
.addField('Atma Sebebi', `${sebep ? sebep : "Sebep Belirtilmedi."}`)
//.setImage('https://cdn.discordapp.com/attachments/762047051533123584/772542454942531604/tenor.gif')
.setColor('RED')
client.channels.cache.get(log).send(logembed)
return
};

message.reply('Bu komutu kullanmak için **Üyeleri At** yetkin olak zorunda.').then(msg => msg.delete({timeout: 5000}))

};

exports.conf = {
    enabled: true, 
    guildOnly: false, 
    aliases: ['kick', 'at', 'tekmele'],
    permLevel: 0
  };
  
  exports.help = {
    name: 'kick', 
    description: 'ban atar',
    usage: 'kick'
  };