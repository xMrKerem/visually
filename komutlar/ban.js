const Discord = require('discord.js');
const db = require('quick.db');
const ayarlar = require('discord.js');

exports.run = async (client, message) => {

  const log = db.fetch('log_' + message.guild.id);
    let kisi;
    message.delete()

  if (message.channel.type == "dm") return message.reply('**Bu komutu özel mesajlarda kullanamazsın.**')

if (message.member.hasPermission("BAN_MEMBERS")) {

if (!message.guild.me.hasPermission("BAN_MEMBERS")) return message.reply('**Görünüşe göre bu sunucuda ``Üyeleri Yasakla`` yetkim bulunmuyor. Bir sunucu yetkilisine gidip bota bu yetkiyi vermesini iste.**').then(msg => msg.delete({timeout: 5000}))

if (!await db.has('log_' + message.guild.id)) {
  return message.reply('Bu sunucu için bir log kanalı bulamıyorum log kanalı ayarlamak için `-log-ayarla <#kanal>`').then(msg => msg.delete({timeout: 5000}))
}

if (!client.channels.cache.has(log)) return message.reply('bu sunucuda belirlenen log kanalı silinmiş veya göremiyorum.')

    const args = message.content.split(' ').slice(1)
    
    const kisi1 = message.mentions.users.first();
    if (kisi1) {
        kisi = kisi1.id;
    
        if (!message.guild.members.cache.get(kisi)) {
            message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
            return
        }
    } else {
        if (args[0]) {
            kisi = args[0];
        
            if (!message.guild.members.cache.get(kisi)) {
                message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
                return
            }
        } else {
            message.reply('kimi banlayacağım?').then(msg => msg.delete({timeout: 5000}))
            return
        }
    }
    
    const uye = message.guild.members.cache.get(kisi);

    if (message.guild.me.roles.highest.position <= uye.roles.highest.position) return message.reply('bu kullanıcının rolleri benim üstümde.').then(msg => msg.delete({timeout: 5000}))
    if (message.member.roles.highest.position <= uye.roles.highest.position) return message.reply('bu kullanıcının rolleri senin üstünde.').then(msg => msg.delete({timeout: 5000}))
    if (uye.id === message.author.id) return message.reply('**kendini banlayamazsın!**').then(msg => msg.delete({timeout: 5000}))
    if (uye.id === client.user.id) return message.reply('**benim komutumla beni banlayamazsın!**').then(msg => msg.delete({timeout: 5000}))

const sebep = args.slice(1).join(' ')
//if (!sebep) sebep = 'Sebep Belirtilmedi.' //return message.reply('sebep belirtmelisin sebepsiz birisini banlayamam.').then(msg => msg.delete({timeout: 5000}))

const embed = new Discord.MessageEmbed()

.setAuthor('Visually', client.user.avatarURL())
.setTitle('**Bir Yetkili Çekicini Salladı!**')
.setThumbnail(uye.user.avatarURL({dynamic: true}))
.addField('Yasaklayan Kişi', `<@${message.author.id}>`, true)
.addField('Yasaklanan Kişi', uye, true)
.addField('Yasaklanma Sebebi', `${sebep ? sebep : "Sebep Belirtilmedi."}`)
//.setImage('https://cdn.discordapp.com/attachments/762047051533123584/772542454942531604/tenor.gif')
.setColor('DARK_RED')
message.channel.send(embed)

const logembed = new Discord.MessageEmbed()

.setAuthor('Visually', client.user.avatarURL())
.setTitle('**Bir Yetkili Çekicini Salladı!**')
.setThumbnail(uye.user.avatarURL({dynamic: true}))
.addField('Yasaklayan Kişi', `<@${message.author.id}>`, true)
.addField('Yasaklanan Kişi', uye, true)
.addField('Yasaklanma Sebebi', `${sebep ? sebep : "Sebep Belirtilmedi."}`)
//.setImage('https://cdn.discordapp.com/attachments/762047051533123584/772542454942531604/tenor.gif')
.setColor('DARK_RED')
client.channels.cache.get(log).send(logembed)
message.guild.member(kisi).ban({reason: sebep ? sebep : "Sebep Belirtilmedi."})
return
}

message.reply('Bu komutu kullanmak için **Üyeleri Yasakla** yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))

};

exports.conf = {
    enabled: true, 
    guildOnly: false, 
    aliases: ['ban', 'yasakla'],
    permLevel: 0
  };
  
  exports.help = {
    name: 'ban', 
    description: 'ban atar',
    usage: 'ban'
  };
