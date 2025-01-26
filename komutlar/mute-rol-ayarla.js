const Discord = require('discord.js');
const db = require('quick.db');


exports.run = async (client, message) => {

    if (message.channel.type == "dm") return message.reply('Bu komutu Özel Mesajlarda Kullanamazsın')

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Bu komutu kullanmak için yetkin yok bu komutu kullanmak için `Yönetici` yetkisine ihtiyacın var').then(msg => msg.delete({timeout: 5000}))

    var rol = message.mentions.roles.first()
    if (!rol) return message.reply('Lütfen Bir Susturma Rolü Belirtiniz.').then(msg => msg.delete({timeout: 5000}))
    var mute = message.guild.roles.cache.get(rol.id)

    if (message.guild.me.roles.highest.position <= mute.position) return message.reply('bu rol benim üstümde.').then(msg => msg.delete({timeout: 5000}))

    db.set('mute_' + message.guild.id, mute.id)
    message.reply('Başarı ile bu sunucudaki mute rolümü <@&' + mute.id + '> yaptım.')
}


exports.conf = {
    enabled: true, 
    guildOnly: true, 
    aliases: ['susturma-rol-ayarla', 'mute-rol-ayarla', 'mute-role-set', 'muteroleset'],
    permLevel: 0
  };
  
  exports.help = {
    name: 'susturma rol ayarla', 
    description: 'sunucudaki mute rolünü değiştirir',
    usage: 'susturma-rol-ayarla'
  };