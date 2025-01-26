const Discord = require('discord.js');
const db = require('quick.db');
const ayarlar = require('../ayarlar.json')


exports.run = async (client, message) => {

    if (!message.author.id === ayarlar.sahip) return

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
            var kisi = message.author.id
        }
    } else {
        var kisi = kisi1.id

        if (!message.guild.members.cache.get(kisi)) {
            message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
            return
        }
    }

    var uye = message.guild.members.cache.get(kisi)

    if (await db.has('premium', uye.id)) return message.reply('bu kullanıcı zaten premium')

    db.set('premium' + uye.id, uye.id)
    message.reply(`başarı ile "${uye}" adlı kişiyi premium yaptım`)
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 5
};

exports.help = {
    name: 'premium',
    description: 'Botu yeniden başlatır',
    usage: 'premium'
};