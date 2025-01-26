const Discord = require('discord.js');
const db = require('quick.db');
const ayarlar = require('../ayarlar.json')


exports.run = async (client, message) => {

    if (await db.has('prefix_' + message.guild.id)) {
        prefix = db.fetch('prefix_' + message.guild.id)
    } else {
        prefix = ayarlar.prefix
    }

    if (message.member.hasPermission('ADMINISTRATOR')) {

        var args = message.content.split(' ').slice(1)

        if (args[0] === 'aç' || args[0] === 'open' || args[0] === 'on') {

            if (await db.has('otorol_' + message.guild.id)) return message.reply(`zaten bu sunucuda bir otorol tanımlamışsınız. Kapatmak veya değiştirmek için \`${prefix}oto-rol kapat\` yazarak otorol\'ü kapatabilirsiniz.`)

            var rol = message.mentions.roles.first()
            if (!rol) return message.reply('bir rol etiketlemelisiniz').then(msg => msg.delete({timeout: 5000}))
            var otorol = message.guild.roles.cache.get(rol.id)

            if (message.guild.me.roles.highest.position <= otorol.position) return message.reply('bu rol benim üstümde.').then(msg => msg.delete({timeout: 5000}))

            db.set('otorol_' + message.guild.id, otorol.id)
            message.reply('başarı ile bu sunucudaki otorol\'ü <@&' + otorol.id + '> yaptım.')
            return

        }

    if (args[0] === 'kapat' || args[0] === 'close' || args[0] === 'off') {

        if (!await db.has('otorol_' + message.guild.id)) return message.reply('zaten bu sunucuda belirlenmiş bir otorol yok.')

        db.delete('otorol_' + message.guild.id)
        message.reply('başarı ile bu sunucudaki otorol\'ü kapattım.')
        return
    }

    }
    message.reply('Bu komutu kullanmak için `YÖNETİCİ` yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["oto-rol-ayarla", "otorolayarla", "otorol-ayarla", "autoroll-set", "autorollset", "otorollset", "otoroleset", "oto-role-set", "autoroleset", "auto-role-set", "oto-rol", "otorol", "autorole", "auto-role"],
    permLevel: 0
}

exports.help = {
    name: "Oto Rol Ayarla",
    description: "Sunucu İçin Otomatik Rol Ayarlar",
    usage: "oto-rol-ayarla"
}