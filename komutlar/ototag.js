const discord = require('discord.js');
const db = require('quick.db');


exports.run = async (client, message) => {

    message.delete()
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Bu komutu kullanmak için `YÖNETİCİ` yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))

    const args = message.content.split(' ').slice(1)
    const tag = args.slice(0).join(' ')
    if (!tag) return message.reply('bu sunucuda yapacağım bir tag belirtmelisin.')

    db.set('ototag' + message.guild.id, tag)
    message.channel.send('başarı ile bu sunucuda oto tag\'ı `' + tag + '` yaptım')
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['oto-tag', 'ototag', 'tag', 'autotag', 'auto-tag'],
    permLevel: 0
};

exports.help = {
    name: 'oto tag',
    description: 'Suncunuz için otomatik tag ayarlar',
    usage: 'ototag'
};