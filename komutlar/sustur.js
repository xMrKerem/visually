const Discord = require('discord.js');
const ms = require('ms');
const moment = require('moment');
require('moment-duration-format');
const db = require('quick.db');

exports.run = async (client, message) => {

  message.delete()

if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply('Bu komutu kullanmak için **Rolleri Yönet** yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))

  if (!await db.has('log_' + message.guild.id)) {
    return message.reply('Bu sunucu için bir log kanalı bulamıyorum log kanalı ayarlamak için `-log-ayarla <#kanal>`').then(msg => msg.delete({timeout: 5000}))
  } else {
    var log = db.fetch('log_' + message.guild.id)
  }

    if (!client.channels.cache.has(log)) return message.reply('bu sunucuda belirlenen log kanalı silinmiş veya göremiyorum.')

  if (!await db.has('mute_' + message.guild.id)) {
    return message.reply('Bu sunucu için bir susturma rolü bulamadım susturma rolü ayarlamak için `-susturma-rol-ayarla <rol etiket>`').then(msg => msg.delete({timeout: 5000}))
  } else {
    var mute = db.fetch('mute_' + message.guild.id)
  }

    if (!message.guild.roles.cache.has(mute)) return message.reply('bu sunucuda belirlenen susturma rolü silinmiş. Lütfen yeni susturma rolü belirtiniz')

    if (message.guild.me.roles.highest.position <= mute.position) return message.reply('susturma rolü benim üstümde bu yüzden uyarı veremem.').then(msg => msg.delete({timeout: 5000}))

        var kisi = message.mentions.users.first()
      if (!kisi) return message.reply('Birisini etiketlemelisin.').then(msg => msg.delete({timeout: 5000}))

      var args = message.content.split(' ').slice(2)
      var sure = args[0]
      var sebep = args.slice(1).join(' ')

      //const uptime = moment.duration(client.uptime).format("D [Gün], H [Saat], M [Dakika], S [Saniye]")

      //if (!sebep) return message.reply('sebep belirtmelisin sebepsiz susturamam.').then(msg => msg.delete({timeout: 5000}))

    if (!sure) return message.reply('süre belirtmelisin süre belirtmezsen susturamam').then(msg => msg.delete({timeout: 5000}))
    
        var uye = message.guild.members.cache.get(kisi.id)

        uye.roles.add(mute)
        var embed = new Discord.MessageEmbed()

.setAuthor('Visually', client.user.avatarURL())
.setTitle('**Bir Yetkili Çekicini Salladı!**')
.setThumbnail(uye.user.avatarURL({dynamic: true}))
.addField('Susturan Kişi', `<@${message.author.id}>`, true)
.addField('Susturulan Kişi', uye, true)
.addField('Susturulma Süresi', sure)
.addField('Susturma Sebebi', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
.setColor('RED')
message.channel.send(embed)

var logembed = new Discord.MessageEmbed()

    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('**Bir Yetkili Çekicini Salladı!**')
    .setThumbnail(uye.user.avatarURL({dynamic: true}))
    .addField('Susturan Kişi', `<@${message.author.id}>`, true)
    .addField('Susturulan Kişi', uye, true)
    .addField('Susturulma Süresi', sure)
    .addField('Susturma Sebebi', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
    .setColor('RED')
client.channels.cache.get(log).send(logembed)
        setTimeout(function(){
          uye.roles.remove(mute)
          message.channel.send(`${uye} adlı kişinin susturması bitti.`)
        }, ms(sure)) 
};

exports.conf = {
    enabled: true, 
    guildOnly: false, 
    aliases: ['sustur', 'mute', 'kes', 'shut-up', 'shutup'],
    permLevel: 1
  };
  
  exports.help = {
    name: 'sustur', 
    description: 'susturur',
    usage: 'sustur'
  };