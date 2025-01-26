const Discord = require('discord.js');
const db = require('quick.db');


exports.run = async (client, message, args) => {

    if (message.channel.type == "dm") return message.reply('Bu komutu Özel Mesajlarda Kullanamazsın')

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Bu komutu kullanmak için `YÖNETİCİ` yetkisinie ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))

    if (args[0] < 1) return message.reply('**lütfen hangi uyarı rolünü tanımladığını belir uyarı 1 ise ``-uyarı-rol-ayarla 1 <rol etiket>`` uyarı 2 ise ``-uyarı-rol-ayarla 2 <rol etiket>``**').then(msg => msg.delete({timeout: 5000}))
    if (args[0] > 2) return message.reply('**lütfen hangi uyarı rolünü tanımladığını belir uyarı 1 ise ``-uyarı-rol-ayarla 1 <rol etiket>`` uyarı 2 ise ``-uyarı-rol-ayarla 2 <rol etiket>``**').then(msg => msg.delete({timeout: 5000}))

    if (args[0] === '1') {

    var rol1 = message.mentions.roles.first()
    if (!rol1) return message.reply('Bir uyarı rolü belirtmelisin').then(msg => msg.delete({timeout: 5000}))
    var uyarı1 = message.guild.roles.cache.get(rol1.id)

        if (message.guild.me.roles.highest.position <= rol1.position) return message.reply('bu rol benim üstümde.').then(msg => msg.delete({timeout: 5000}))

    db.set('uyarı1_' + message.guild.id, uyarı1.id)
    message.reply(`Başarı ile bu sunucuda uyarı 1 rolünü başarı ile **<@&${uyarı1.id}>** yaptım.`)
    }

    if (args[0] === '2') {

    var rol2 = message.mentions.roles.first()
    if (!rol2) return message.reply('Bir uyarı rolü belirtmelisin')
    var uyarı2 = message.guild.roles.cache.get(rol2.id)

        if (message.guild.me.roles.highest.position <= rol2.position) return message.reply('bu rol benim üstümde.').then(msg => msg.delete({timeout: 5000}))

    db.set('uyarı2_' + message.guild.id, uyarı2.id)
    message.reply(`Başarı ile bu sunucuda uyarı 2 rolünü başarı ile **<@&${uyarı2.id}>** yaptım.`)
    }
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["uyarı", "uyarı-rol", "uyarı-rol-ayarla", 'alert-role-set', 'alertroleset', 'warn-role-set', 'warnroleset'],
    permLevel: 0
};

exports.help = {
    name: "Uyarı Rol Ayarla",
    description: "Uyarı Rolü Ayarlarsınız",
    usage: "uyarı-rol"
}