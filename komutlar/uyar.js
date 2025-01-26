const Discord = require('discord.js');
const db = require('quick.db');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message) => {

    let kisi;
    if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply('Bu komutu kullanmak için **Rolleri Yönet** yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))

    if (!await db.has("uyarı1_" + message.guild.id) || !await db.has("uyarı2_" + message.guild.id)) {
   return message.reply('Lütfen bu sunucu için uyarı rollerini ayarlayınız ayarlamak için `-uyarı-ayarla @rol1 @rol2` yapınız.').then(msg => msg.delete({timeout: 5000}))
} else {
    var uyarı1 = db.fetch("uyarı1_" + message.guild.id)
    var uyarı2 = db.fetch("uyarı2_" + message.guild.id)
}

    if (!message.guild.roles.cache.has(uyarı1)) return message.reply('bu sunucuda belirlenen uyarı 1 rolü silinmiş. Lütfen yeni uyarı 1 rolü belirtiniz.')
    if (!message.guild.roles.cache.has(uyarı2)) return message.reply('bu sunucuda belirlenen uyarı 2 rolü silinmiş. Lütfen yeni uyarı 2 rolü belirtiniz.')

    if (message.guild.me.roles.highest.position <= rol2.position) return message.reply('uyarı 2 rolü benim üstümde bu yüzden uyarı veremem.').then(msg => msg.delete({timeout: 5000}))
    if (message.guild.me.roles.highest.position <= rol1.position) return message.reply('uyarı 1 rolü benim üstümde bu yüzden uyarı veremem.').then(msg => msg.delete({timeout: 5000}))

if (!await db.has('log_' + message.guild.id)) {
    return message.reply('Bu sunucu için bir log kanalı bulamıyorum log kanalı ayarlamak için `-log-ayarla <#kanal>`')
  } else {
    var log = db.fetch('log_' + message.guild.id)
  }

    if (!client.channels.cache.has(log.id)) return message.reply('bu sunucuda belirlenen log kanalı silinmiş veya göremiyorum.')

    const args = message.content.split(' ').slice(1)

    var kisi1 = message.mentions.users.first()
    if (!kisi1) {
        if (args[0]) {
            kisi = args[0];

            if (!message.guild.members.cache.get(kisi)) {
                message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
                return
            }
        } else {
            message.reply('kime uyarı vereceğim?').then(msg => msg.delete({timeout: 5000}))
            return
        }
    } else {
        kisi = kisi1.id;
    
        if (!message.guild.members.cache.get(kisi)) {
            message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
            return
        }
    }

    var uye = message.guild.members.cache.get(kisi)

    if (message.guild.me.roles.highest.position <= uye.roles.highest.position) return message.reply('bu kullanıcının rolleri benim üstümde.').then(msg => msg.delete({timeout: 5000}))
    if (message.member.roles.highest.position <= uye.roles.highest.position) return message.reply('bu kullanıcının rolleri senin üstünde.').then(msg => msg.delete({timeout: 5000}))

const sebep = args.slice(1).join(' ')
//if (!sebep) sebep = 'Sebep Belirtilmedi.' //return message.reply('Sebepsiz birine uyarı veremem').then(msg => msg.delete({timeout: 5000}))

    if (message.member.hasPermission('BAN_MEMBERS')) {
        
        if (uye.roles.cache.has(uyarı2)) {

            var embed1 = new Discord.MessageEmbed()
            .setAuthor('Visually', client.user.avatarURL())
            .setTitle('Bir Uyarı Atıldı')
            .setThumbnail(uye.user.avatarURL({dynamic: true}))
            .addField('Uyarıyı Alan Kişi', `<@${uye.id}>`, true)
            .addField('Sebep', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
            .addField('Uyarıyı Veren', `<@${message.author.id}>`)
            .addField('Aldığı Ceza', 'Uyarı 3 ve Ban', true)
            message.channel.send(embed1)

            var logembed1 = new Discord.MessageEmbed()
            .setAuthor('Visually', client.user.avatarURL())
            .setTitle('Bir Uyarı Atıldı')
            .setThumbnail(uye.user.avatarURL({dynamic: true}))
            .addField('Uyarıyı Alan Kişi', `<@${uye.id}>`, true)
            .addField('Sebep', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
            .addField('Uyarıyı Veren', `<@${message.author.id}>`)
            .addField('Aldığı Ceza', 'Uyarı 3 ve Ban', true)
            client.channels.cache.get(log).send(logembed1)
            message.guild.user.ban(sebep)
            return
        }
    }

        if (uye.roles.cache.has(uyarı1)) {

            uye.roles.remove(uyarı1)
            uye.roles.add(uyarı2)

            var embed2 = new Discord.MessageEmbed()
            .setAuthor('Visually', client.user.avatarURL())
            .setTitle('Bir Uyarı Atıldı')
            .setThumbnail(uye.user.avatarURL({dynamic: true}))
            .addField('Uyarıyı Alan Kişi', `<@${uye.id}>`, true)
            .addField('Sebep', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
            .addField('Uyarıyı Veren', `<@${message.author.id}>`)
            .addField('Aldığı Ceza', 'Uyarı 2', true)
            message.channel.send(embed2)

            var logembed2 = new Discord.MessageEmbed()
            .setAuthor('Visually', client.user.avatarURL())
            .setTitle('Bir Uyarı Atıldı')
            .setThumbnail(uye.user.avatarURL({dynamic: true}))
            .addField('Uyarıyı Alan Kişi', `<@${uye.id}>`, true)
            .addField('Sebep', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
            .addField('Uyarıyı Veren', `<@${message.author.id}>`)
            .addField('Aldığı Ceza', 'Uyarı 2', true)
            client.channels.cache.get(log).send(logembed2)
            return
        }

            var embed3 = new Discord.MessageEmbed()
            .setAuthor('Visually', client.user.avatarURL())
            .setTitle('Bir Uyarı Atıldı')
            .setThumbnail(uye.user.avatarURL({dynamic: true}))
            .addField('Uyarıyı Alan Kişi', `<@${uye.id}>`, true)
            .addField('Sebep', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
            .addField('Uyarıyı Veren', `<@${message.author.id}>`)
            .addField('Aldığı Ceza', 'Uyarı 1', true)
            message.channel.send(embed3)

            var logembed3 = new Discord.MessageEmbed()
            .setAuthor('Visually', client.user.avatarURL())
            .setTitle('Bir Uyarı Atıldı')
            .setThumbnail(uye.user.avatarURL({dynamic: true}))
            .addField('Uyarıyı Alan Kişi', `<@${uye.id}>`, true)
            .addField('Sebep', `${sebep ? sebep : "Sebep Belirtilmedi."}`, true)
            .addField('Uyarıyı Veren', `<@${message.author.id}>`)
            .addField('Aldığı Ceza', 'Uyarı 1', true)
            client.channels.cache.get(log).send(logembed3)
            uye.roles.add(uyarı1)
            return
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["uyar", "uyarı-ver", "warn", "alert"],
    permLevel: 0
};

exports.help = {
    name: "Uyar",
    description: "İstediğiniz Kişiye Uyarı Verir",
    usage: "uyar"
};
